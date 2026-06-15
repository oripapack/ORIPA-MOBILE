-- Vault fulfillment lifecycle + deferred Grail mint (mint on physical shipment request).

-- ---------------------------------------------------------------------------
-- pull_results: allow mint_deferred status
-- ---------------------------------------------------------------------------
alter table public.pull_results
  drop constraint if exists pull_results_mint_status_check;

alter table public.pull_results
  add constraint pull_results_mint_status_check
  check (
    mint_status in (
      'mint_pending',
      'mint_deferred',
      'mint_completed',
      'mint_skipped_no_wallet',
      'mint_skipped_low_tier',
      'mint_failed'
    )
  );

comment on column public.pull_results.mint_status is
  'mint_deferred: Grail win awaiting shipment request; mint_pending: queued for Thirdweb.';

-- ---------------------------------------------------------------------------
-- vault_fulfillments: physical lifecycle for Grail / should_mint pulls
-- ---------------------------------------------------------------------------
create table public.vault_fulfillments (
  id uuid primary key default gen_random_uuid(),
  pull_id uuid not null unique references public.pull_results (id) on delete restrict,
  fulfillment_status text not null default 'vaulted'
    check (
      fulfillment_status in (
        'vaulted',
        'shipment_requested',
        'shipped',
        'converted_to_credits'
      )
    ),
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vault_fulfillments_status_idx
  on public.vault_fulfillments (fulfillment_status, created_at);

create trigger vault_fulfillments_set_updated_at
  before update on public.vault_fulfillments
  for each row
  execute function public.set_updated_at();

comment on table public.vault_fulfillments is
  'Server-side vault / shipping state for high-value pulls (Grail).';

alter table public.vault_fulfillments enable row level security;

create policy "vault_fulfillments_select_own"
  on public.vault_fulfillments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pull_results pr
      where pr.id = vault_fulfillments.pull_id
        and pr.user_id = public.auth_user_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Atomic pull: defer Grail mint + seed vault_fulfillments
-- ---------------------------------------------------------------------------
create or replace function public.process_atomic_pull(
  p_pack_version_id uuid,
  p_idempotency_key uuid,
  p_client_seed text,
  p_nonce int,
  p_hashed_server_seed text,
  p_revealed_server_seed text,
  p_digest_hex text,
  p_roll_value bigint,
  p_won_item_id text,
  p_card_name text,
  p_serial_number text,
  p_provenance_at timestamptz,
  p_should_mint boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text;
  v_cost bigint;
  v_is_active boolean;
  v_balance bigint;
  v_mint_status text;
  v_pull_id uuid;
  v_existing_pull uuid;
begin
  v_user_id := public.auth_user_id();
  if v_user_id is null or length(trim(v_user_id)) = 0 then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_idempotency_key is null then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  select pr.id into v_existing_pull
  from public.credit_transactions ct
  join public.pull_results pr on pr.id = ct.reference_id
  where ct.idempotency_key = p_idempotency_key::text
    and ct.user_id = v_user_id
    and ct.type = 'pack_spend';

  if v_existing_pull is not null then
    return (
      select jsonb_build_object(
        'status', 'already_processed',
        'pull_id', pr.id,
        'mint_status', pr.mint_status,
        'won_item_id', pr.won_item_id,
        'card_name', pr.card_name,
        'serial_number', pr.serial_number,
        'digest_hex', pr.digest_hex,
        'roll_value', pr.roll_value
      )
      from public.pull_results pr
      where pr.id = v_existing_pull
    );
  end if;

  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  select pv.credit_cost, pv.is_active
  into v_cost, v_is_active
  from public.pack_versions pv
  where pv.id = p_pack_version_id
  for update;

  if not found then
    raise exception 'UNKNOWN_PACK_VERSION';
  end if;

  if not v_is_active then
    raise exception 'PACK_VERSION_INACTIVE';
  end if;

  insert into public.user_credits (user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select uc.balance into v_balance
  from public.user_credits uc
  where uc.user_id = v_user_id
  for update;

  if v_balance < v_cost then
    raise exception 'INSUFFICIENT_CREDITS'
      using hint = format('required=%s available=%s', v_cost, v_balance);
  end if;

  update public.user_credits
  set balance = balance - v_cost,
      updated_at = now()
  where user_id = v_user_id;

  if p_should_mint then
    v_mint_status := 'mint_deferred';
  else
    v_mint_status := 'mint_skipped_low_tier';
  end if;

  insert into public.pull_results (
    user_id,
    pack_version_id,
    seed_pair_id,
    client_seed,
    nonce,
    hashed_server_seed,
    revealed_server_seed,
    digest_hex,
    roll_value,
    won_item_id,
    card_name,
    serial_number,
    provenance_at,
    mint_status
  )
  values (
    v_user_id,
    p_pack_version_id,
    null,
    p_client_seed,
    p_nonce,
    p_hashed_server_seed,
    p_revealed_server_seed,
    p_digest_hex,
    p_roll_value,
    p_won_item_id,
    p_card_name,
    p_serial_number,
    p_provenance_at,
    v_mint_status
  )
  returning id into v_pull_id;

  if p_should_mint then
    insert into public.vault_fulfillments (pull_id, fulfillment_status)
    values (v_pull_id, 'vaulted');
  end if;

  insert into public.credit_transactions (
    user_id,
    amount,
    type,
    idempotency_key,
    description,
    reference_id
  )
  values (
    v_user_id,
    -v_cost,
    'pack_spend',
    p_idempotency_key::text,
    format('Pack open %s', p_pack_version_id),
    v_pull_id
  );

  return jsonb_build_object(
    'status', 'ok',
    'pull_id', v_pull_id,
    'mint_status', v_mint_status,
    'credit_cost', v_cost,
    'balance_after', v_balance - v_cost,
    'won_item_id', p_won_item_id,
    'card_name', p_card_name,
    'serial_number', p_serial_number,
    'digest_hex', p_digest_hex,
    'roll_value', p_roll_value
  );
exception
  when unique_violation then
    select pr.id into v_existing_pull
    from public.credit_transactions ct
    join public.pull_results pr on pr.id = ct.reference_id
    where ct.idempotency_key = p_idempotency_key::text
      and ct.user_id = v_user_id;

    if v_existing_pull is not null then
      return (
        select jsonb_build_object(
          'status', 'already_processed',
          'pull_id', pr.id,
          'mint_status', pr.mint_status,
          'won_item_id', pr.won_item_id,
          'card_name', pr.card_name,
          'serial_number', pr.serial_number,
          'digest_hex', pr.digest_hex,
          'roll_value', pr.roll_value
        )
        from public.pull_results pr
        where pr.id = v_existing_pull
      );
    end if;
    raise;
end;
$$;

-- ---------------------------------------------------------------------------
-- Shipment request: vaulted → shipment_requested + queue mint
-- ---------------------------------------------------------------------------
create or replace function public.request_physical_shipment(
  p_pull_id uuid,
  p_shipping_address jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text;
  v_pull record;
  v_fulfillment record;
begin
  v_user_id := public.auth_user_id();
  if v_user_id is null or length(trim(v_user_id)) = 0 then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_pull_id is null then
    raise exception 'PULL_ID_REQUIRED';
  end if;

  if p_shipping_address is null
    or coalesce(trim(p_shipping_address->>'fullName'), '') = ''
    or coalesce(trim(p_shipping_address->>'line1'), '') = ''
    or coalesce(trim(p_shipping_address->>'city'), '') = ''
    or coalesce(trim(p_shipping_address->>'country'), '') = ''
  then
    raise exception 'INVALID_SHIPPING_ADDRESS';
  end if;

  select pr.id, pr.user_id, pr.mint_status
  into v_pull
  from public.pull_results pr
  where pr.id = p_pull_id
  for update;

  if not found then
    raise exception 'PULL_NOT_FOUND';
  end if;

  if v_pull.user_id <> v_user_id then
    raise exception 'FORBIDDEN';
  end if;

  select vf.id, vf.fulfillment_status
  into v_fulfillment
  from public.vault_fulfillments vf
  where vf.pull_id = p_pull_id
  for update;

  if not found then
    raise exception 'NOT_ELIGIBLE_FOR_SHIPMENT';
  end if;

  if v_fulfillment.fulfillment_status = 'converted_to_credits' then
    raise exception 'ALREADY_CONVERTED';
  end if;

  if v_fulfillment.fulfillment_status = 'shipped' then
    raise exception 'ALREADY_SHIPPED';
  end if;

  if v_pull.mint_status = 'mint_completed' then
    raise exception 'ALREADY_MINTED';
  end if;

  if v_fulfillment.fulfillment_status = 'shipment_requested' then
    return jsonb_build_object(
      'status', 'already_requested',
      'pull_id', p_pull_id,
      'fulfillment_status', v_fulfillment.fulfillment_status,
      'mint_status', v_pull.mint_status
    );
  end if;

  if v_fulfillment.fulfillment_status <> 'vaulted' then
    raise exception 'INVALID_FULFILLMENT_STATUS';
  end if;

  if v_pull.mint_status not in ('mint_deferred', 'mint_skipped_no_wallet') then
    raise exception 'INVALID_MINT_STATUS';
  end if;

  update public.vault_fulfillments
  set fulfillment_status = 'shipment_requested',
      shipping_address = p_shipping_address,
      updated_at = now()
  where pull_id = p_pull_id;

  update public.pull_results
  set mint_status = 'mint_pending',
      mint_last_error = null
  where id = p_pull_id;

  return jsonb_build_object(
    'status', 'ok',
    'pull_id', p_pull_id,
    'fulfillment_status', 'shipment_requested',
    'mint_status', 'mint_pending'
  );
end;
$$;

revoke all on function public.request_physical_shipment from public;
grant execute on function public.request_physical_shipment to authenticated;
grant execute on function public.request_physical_shipment to service_role;
