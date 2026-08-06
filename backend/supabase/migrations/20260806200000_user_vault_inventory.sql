-- Phase 3: Real card inventory — user_vault_items + instant trade-in ledger sync.

-- ---------------------------------------------------------------------------
-- user_vault_items: server source of truth for vaulted pulls
-- ---------------------------------------------------------------------------
create table if not exists public.user_vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  pull_id uuid not null unique references public.pull_results (id) on delete restrict,
  card_id text not null,
  card_name text not null,
  rarity_tier text not null
    check (rarity_tier in ('mythic', 'legendary', 'epic', 'base')),
  acquisition_type text not null default 'pack_pull'
    check (acquisition_type in ('pack_pull')),
  status text not null default 'vaulted'
    check (status in ('vaulted', 'instant_traded', 'shipped')),
  trade_in_value_credits bigint not null check (trade_in_value_credits > 0),
  pack_version_id uuid references public.pack_versions (id) on delete set null,
  vault_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_vault_items_user_status_idx
  on public.user_vault_items (user_id, status, created_at desc);

create trigger user_vault_items_set_updated_at
  before update on public.user_vault_items
  for each row
  execute function public.set_updated_at();

comment on table public.user_vault_items is
  'User card inventory from pack pulls; status drives vault / trade-in / ship lifecycle.';

alter table public.user_vault_items enable row level security;

create policy "user_vault_items_select_own"
  on public.user_vault_items
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

-- ---------------------------------------------------------------------------
-- Ledger: trade-in credits (positive entries)
-- ---------------------------------------------------------------------------
alter table public.credit_transactions
  drop constraint if exists credit_transactions_transaction_type_check;

alter table public.credit_transactions
  add constraint credit_transactions_transaction_type_check
  check (
    transaction_type in (
      'top_up',
      'pack_spend',
      'bulk_pack_spend',
      'refund',
      'trade_in_credit'
    )
  );

create or replace function public.compute_trade_in_credits(
  p_pack_credit_cost bigint,
  p_rarity_tier text
)
returns bigint
language sql
immutable
as $$
  select greatest(
    0,
    floor(
      p_pack_credit_cost::numeric *
      case lower(coalesce(p_rarity_tier, 'base'))
        when 'mythic' then 2.8
        when 'legendary' then 2.5
        when 'epic' then 1.4
        else 0.85
      end
    )::bigint
  );
$$;

comment on function public.compute_trade_in_credits is
  '100% listed-value trade-in credits from pack price × N2 tier multiplier.';

create or replace function public.credit_user_credits(
  p_user_id text,
  p_amount bigint,
  p_idempotency_key text,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.credit_transactions%rowtype;
  v_balance_after bigint;
  v_tx_id uuid;
  v_type text;
begin
  if p_user_id is null or length(trim(p_user_id)) = 0 then
    raise exception 'USER_ID_REQUIRED';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  v_type := coalesce(nullif(p_metadata->>'transaction_type', ''), 'trade_in_credit');

  select * into v_existing
  from public.credit_transactions ct
  where ct.user_id = p_user_id
    and ct.idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'status', 'already_processed',
      'error_code', 'DUPLICATE_TRANSACTION',
      'transaction_id', v_existing.id,
      'balance_after', (
        select uc.balance from public.user_credits uc where uc.user_id = p_user_id
      ),
      'amount', v_existing.amount,
      'reference_id', v_existing.reference_id
    );
  end if;

  insert into public.profiles (id)
  values (p_user_id)
  on conflict (id) do nothing;

  insert into public.user_credits (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_credits
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_balance_after;

  insert into public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    idempotency_key,
    reference_id,
    metadata
  )
  values (
    p_user_id,
    p_amount,
    v_type,
    p_idempotency_key,
    p_reference_id,
    coalesce(p_metadata, '{}'::jsonb) - 'transaction_type'
  )
  returning id into v_tx_id;

  return jsonb_build_object(
    'status', 'ok',
    'transaction_id', v_tx_id,
    'balance_after', v_balance_after,
    'amount', p_amount,
    'reference_id', p_reference_id
  );
exception
  when unique_violation then
    select * into v_existing
    from public.credit_transactions ct
    where ct.user_id = p_user_id
      and ct.idempotency_key = p_idempotency_key;

    return jsonb_build_object(
      'status', 'already_processed',
      'error_code', 'DUPLICATE_TRANSACTION',
      'transaction_id', v_existing.id,
      'balance_after', (
        select uc.balance from public.user_credits uc where uc.user_id = p_user_id
      ),
      'amount', v_existing.amount,
      'reference_id', v_existing.reference_id
    );
end;
$$;

revoke all on function public.credit_user_credits from public;
grant execute on function public.credit_user_credits to authenticated;
grant execute on function public.credit_user_credits to service_role;

-- ---------------------------------------------------------------------------
-- Instant trade-in: credit wallet + mark vault item instant_traded
-- ---------------------------------------------------------------------------
create or replace function public.process_instant_trade_in(
  p_vault_item_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text;
  v_item public.user_vault_items%rowtype;
  v_credit jsonb;
begin
  v_user_id := public.auth_user_id();
  if v_user_id is null or length(trim(v_user_id)) = 0 then
    raise exception 'UNAUTHORIZED';
  end if;

  if p_vault_item_id is null then
    raise exception 'VAULT_ITEM_ID_REQUIRED';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  select * into v_item
  from public.user_vault_items uvi
  where uvi.id = p_vault_item_id
    and uvi.user_id = v_user_id
  for update;

  if not found then
    raise exception 'VAULT_ITEM_NOT_FOUND';
  end if;

  if v_item.status = 'instant_traded' then
    return jsonb_build_object(
      'status', 'already_processed',
      'error_code', 'DUPLICATE_TRANSACTION',
      'vault_item_id', v_item.id,
      'pull_id', v_item.pull_id,
      'credits_added', v_item.trade_in_value_credits,
      'balance_after', (
        select uc.balance from public.user_credits uc where uc.user_id = v_user_id
      )
    );
  end if;

  if v_item.status <> 'vaulted' then
    raise exception 'VAULT_ITEM_NOT_TRADEABLE';
  end if;

  v_credit := public.credit_user_credits(
    v_user_id,
    v_item.trade_in_value_credits,
    p_idempotency_key,
    v_item.pull_id,
    jsonb_build_object(
      'transaction_type', 'trade_in_credit',
      'vault_item_id', v_item.id::text,
      'card_id', v_item.card_id,
      'card_name', v_item.card_name,
      'rarity_tier', v_item.rarity_tier
    )
  );

  if v_credit->>'status' = 'error' then
    raise exception 'TRADE_IN_FAILED: %', coalesce(v_credit->>'error_code', 'unknown');
  end if;

  update public.user_vault_items
  set status = 'instant_traded',
      updated_at = now()
  where id = v_item.id;

  return jsonb_build_object(
    'status', coalesce(v_credit->>'status', 'ok'),
    'vault_item_id', v_item.id,
    'pull_id', v_item.pull_id,
    'credits_added', v_item.trade_in_value_credits,
    'balance_after', (v_credit->>'balance_after')::bigint,
    'transaction_id', v_credit->>'transaction_id',
    'card_name', v_item.card_name,
    'rarity_tier', v_item.rarity_tier
  );
end;
$$;

revoke all on function public.process_instant_trade_in from public;
grant execute on function public.process_instant_trade_in to authenticated;
grant execute on function public.process_instant_trade_in to service_role;

-- ---------------------------------------------------------------------------
-- Atomic pull: seed user_vault_items on every successful pull
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
  v_mint_status text;
  v_pull_id uuid;
  v_vault_item_id uuid;
  v_existing_pull uuid;
  v_deduct jsonb;
  v_tx_id uuid;
  v_balance_after bigint;
  v_rarity text;
  v_trade_in bigint;
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
    and ct.transaction_type in ('pack_spend', 'bulk_pack_spend');

  if v_existing_pull is not null then
    return (
      select jsonb_build_object(
        'status', 'already_processed',
        'error_code', 'DUPLICATE_TRANSACTION',
        'pull_id', pr.id,
        'mint_status', pr.mint_status,
        'won_item_id', pr.won_item_id,
        'card_name', pr.card_name,
        'serial_number', pr.serial_number,
        'digest_hex', pr.digest_hex,
        'roll_value', pr.roll_value,
        'balance_after', (
          select uc.balance from public.user_credits uc where uc.user_id = v_user_id
        ),
        'vault_item_id', uvi.id,
        'vault_item', jsonb_build_object(
          'id', uvi.id,
          'pull_id', uvi.pull_id,
          'card_id', uvi.card_id,
          'card_name', uvi.card_name,
          'rarity_tier', uvi.rarity_tier,
          'status', uvi.status,
          'trade_in_value_credits', uvi.trade_in_value_credits,
          'vault_expires_at', uvi.vault_expires_at
        )
      )
      from public.pull_results pr
      left join public.user_vault_items uvi on uvi.pull_id = pr.id
      where pr.id = v_existing_pull
    );
  end if;

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

  select coalesce(nullif(lower(trim(ppi.rarity_tier)), ''), 'base')
  into v_rarity
  from public.pack_pool_items ppi
  where ppi.pack_version_id = p_pack_version_id
    and ppi.item_id = p_won_item_id
  limit 1;

  if v_rarity is null then
    v_rarity := 'base';
  end if;

  v_trade_in := public.compute_trade_in_credits(v_cost, v_rarity);

  v_deduct := public.deduct_user_credits(
    v_user_id,
    v_cost,
    p_idempotency_key::text,
    null,
    jsonb_build_object(
      'transaction_type', 'pack_spend',
      'pack_version_id', p_pack_version_id::text,
      'won_item_id', p_won_item_id
    )
  );

  if v_deduct->>'status' = 'error' then
    if v_deduct->>'error_code' = 'INSUFFICIENT_FUNDS' then
      raise exception 'INSUFFICIENT_CREDITS'
        using hint = format(
          'required=%s available=%s',
          v_cost,
          coalesce((v_deduct->>'balance_after')::bigint, 0)
        );
    end if;
    raise exception 'DEDUCT_FAILED: %', v_deduct->>'error_code';
  end if;

  if v_deduct->>'status' = 'already_processed' then
    if (v_deduct->>'reference_id') is not null then
      return (
        select jsonb_build_object(
          'status', 'already_processed',
          'error_code', 'DUPLICATE_TRANSACTION',
          'pull_id', pr.id,
          'mint_status', pr.mint_status,
          'won_item_id', pr.won_item_id,
          'card_name', pr.card_name,
          'serial_number', pr.serial_number,
          'digest_hex', pr.digest_hex,
          'roll_value', pr.roll_value,
          'balance_after', (v_deduct->>'balance_after')::bigint,
          'vault_item_id', uvi.id,
          'vault_item', jsonb_build_object(
            'id', uvi.id,
            'pull_id', uvi.pull_id,
            'card_id', uvi.card_id,
            'card_name', uvi.card_name,
            'rarity_tier', uvi.rarity_tier,
            'status', uvi.status,
            'trade_in_value_credits', uvi.trade_in_value_credits,
            'vault_expires_at', uvi.vault_expires_at
          )
        )
        from public.pull_results pr
        left join public.user_vault_items uvi on uvi.pull_id = pr.id
        where pr.id = (v_deduct->>'reference_id')::uuid
      );
    end if;
    raise exception 'DUPLICATE_TRANSACTION';
  end if;

  v_tx_id := (v_deduct->>'transaction_id')::uuid;
  v_balance_after := (v_deduct->>'balance_after')::bigint;

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

  update public.credit_transactions
  set reference_id = v_pull_id
  where id = v_tx_id;

  insert into public.user_vault_items (
    user_id,
    pull_id,
    card_id,
    card_name,
    rarity_tier,
    acquisition_type,
    status,
    trade_in_value_credits,
    pack_version_id,
    vault_expires_at,
    metadata
  )
  values (
    v_user_id,
    v_pull_id,
    p_won_item_id,
    p_card_name,
    v_rarity,
    'pack_pull',
    'vaulted',
    greatest(v_trade_in, 1),
    p_pack_version_id,
    now() + interval '14 days',
    jsonb_build_object('should_mint', p_should_mint)
  )
  returning id into v_vault_item_id;

  return jsonb_build_object(
    'status', 'ok',
    'pull_id', v_pull_id,
    'mint_status', v_mint_status,
    'credit_cost', v_cost,
    'balance_after', v_balance_after,
    'won_item_id', p_won_item_id,
    'card_name', p_card_name,
    'serial_number', p_serial_number,
    'digest_hex', p_digest_hex,
    'roll_value', p_roll_value,
    'transaction_id', v_tx_id,
    'vault_item_id', v_vault_item_id,
    'vault_item', jsonb_build_object(
      'id', v_vault_item_id,
      'pull_id', v_pull_id,
      'card_id', p_won_item_id,
      'card_name', p_card_name,
      'rarity_tier', v_rarity,
      'status', 'vaulted',
      'trade_in_value_credits', greatest(v_trade_in, 1),
      'vault_expires_at', now() + interval '14 days'
    )
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
          'error_code', 'DUPLICATE_TRANSACTION',
          'pull_id', pr.id,
          'mint_status', pr.mint_status,
          'won_item_id', pr.won_item_id,
          'card_name', pr.card_name,
          'serial_number', pr.serial_number,
          'digest_hex', pr.digest_hex,
          'roll_value', pr.roll_value,
          'vault_item_id', uvi.id,
          'vault_item', jsonb_build_object(
            'id', uvi.id,
            'pull_id', uvi.pull_id,
            'card_id', uvi.card_id,
            'card_name', uvi.card_name,
            'rarity_tier', uvi.rarity_tier,
            'status', uvi.status,
            'trade_in_value_credits', uvi.trade_in_value_credits,
            'vault_expires_at', uvi.vault_expires_at
          )
        )
        from public.pull_results pr
        left join public.user_vault_items uvi on uvi.pull_id = pr.id
        where pr.id = v_existing_pull
      );
    end if;
    raise;
end;
$$;

revoke all on function public.process_atomic_pull from public;
grant execute on function public.process_atomic_pull to authenticated;
grant execute on function public.process_atomic_pull to service_role;

-- Shipment hook: mark vault inventory shipped when fulfillment ships
create or replace function public.sync_vault_item_shipped(p_pull_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_vault_items
  set status = 'shipped',
      updated_at = now()
  where pull_id = p_pull_id
    and status = 'vaulted';
end;
$$;

revoke all on function public.sync_vault_item_shipped from public;
grant execute on function public.sync_vault_item_shipped to service_role;
