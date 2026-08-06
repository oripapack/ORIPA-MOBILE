-- Phase 4: Physical fulfillment — shipping_addresses, shipping_orders, request_physical_fulfillment.

-- ---------------------------------------------------------------------------
-- user_vault_items: allow shipping_requested intermediate status
-- ---------------------------------------------------------------------------
alter table public.user_vault_items
  drop constraint if exists user_vault_items_status_check;

alter table public.user_vault_items
  add constraint user_vault_items_status_check
  check (status in ('vaulted', 'shipping_requested', 'instant_traded', 'shipped'));

-- ---------------------------------------------------------------------------
-- shipping_addresses
-- ---------------------------------------------------------------------------
create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  recipient_name text not null,
  street1 text not null,
  street2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipping_addresses_user_idx
  on public.shipping_addresses (user_id, created_at desc);

create trigger shipping_addresses_set_updated_at
  before update on public.shipping_addresses
  for each row
  execute function public.set_updated_at();

comment on table public.shipping_addresses is
  'Saved physical shipping destinations for vault redemptions.';

alter table public.shipping_addresses enable row level security;

create policy "shipping_addresses_select_own"
  on public.shipping_addresses
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

create policy "shipping_addresses_insert_own"
  on public.shipping_addresses
  for insert
  to authenticated
  with check (public.auth_user_id() = user_id);

create policy "shipping_addresses_update_own"
  on public.shipping_addresses
  for update
  to authenticated
  using (public.auth_user_id() = user_id)
  with check (public.auth_user_id() = user_id);

create policy "shipping_addresses_delete_own"
  on public.shipping_addresses
  for delete
  to authenticated
  using (public.auth_user_id() = user_id);

-- ---------------------------------------------------------------------------
-- shipping_orders + line items
-- ---------------------------------------------------------------------------
create table if not exists public.shipping_orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  shipping_address_id uuid not null references public.shipping_addresses (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  carrier text,
  fee_credits bigint not null default 0 check (fee_credits >= 0),
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  shipped_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index if not exists shipping_orders_user_status_idx
  on public.shipping_orders (user_id, status, created_at desc);

create trigger shipping_orders_set_updated_at
  before update on public.shipping_orders
  for each row
  execute function public.set_updated_at();

comment on table public.shipping_orders is
  'Physical redemption orders linking vault inventory to a shipping address.';

alter table public.shipping_orders enable row level security;

create policy "shipping_orders_select_own"
  on public.shipping_orders
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

create table if not exists public.shipping_order_items (
  id uuid primary key default gen_random_uuid(),
  shipping_order_id uuid not null references public.shipping_orders (id) on delete cascade,
  vault_item_id uuid not null references public.user_vault_items (id) on delete restrict,
  pull_id uuid not null references public.pull_results (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (vault_item_id)
);

create index if not exists shipping_order_items_order_idx
  on public.shipping_order_items (shipping_order_id);

alter table public.shipping_order_items enable row level security;

create policy "shipping_order_items_select_own"
  on public.shipping_order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.shipping_orders so
      where so.id = shipping_order_items.shipping_order_id
        and so.user_id = public.auth_user_id()
    )
  );

-- Optional shipping fee (0 = free). Override via app.shipping_fee_credits GUC if needed.
create or replace function public.default_shipping_fee_credits()
returns bigint
language sql
stable
as $$
  select 0::bigint;
$$;

-- ---------------------------------------------------------------------------
-- request_physical_fulfillment: vaulted → shipping_requested (+ optional fee)
-- ---------------------------------------------------------------------------
create or replace function public.request_physical_fulfillment(
  p_user_id text,
  p_vault_item_ids uuid[],
  p_address_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_id text;
  v_user_id text;
  v_address public.shipping_addresses%rowtype;
  v_existing public.shipping_orders%rowtype;
  v_order_id uuid;
  v_fee bigint;
  v_deduct jsonb;
  v_item public.user_vault_items%rowtype;
  v_ids uuid[];
  v_count int;
  v_item_ids uuid[] := array[]::uuid[];
  v_pull_ids uuid[] := array[]::uuid[];
begin
  v_auth_id := public.auth_user_id();
  if v_auth_id is null or length(trim(v_auth_id)) = 0 then
    raise exception 'UNAUTHORIZED';
  end if;

  v_user_id := coalesce(nullif(trim(p_user_id), ''), v_auth_id);
  if v_user_id <> v_auth_id then
    raise exception 'FORBIDDEN';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  if p_address_id is null then
    raise exception 'ADDRESS_ID_REQUIRED';
  end if;

  if p_vault_item_ids is null or cardinality(p_vault_item_ids) = 0 then
    raise exception 'VAULT_ITEMS_REQUIRED';
  end if;

  -- Deduplicate requested ids
  select array_agg(distinct x)
  into v_ids
  from unnest(p_vault_item_ids) as x;

  v_count := coalesce(cardinality(v_ids), 0);

  select * into v_existing
  from public.shipping_orders so
  where so.user_id = v_user_id
    and so.idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'status', 'already_processed',
      'error_code', 'DUPLICATE_TRANSACTION',
      'shipping_order_id', v_existing.id,
      'order_status', v_existing.status,
      'fee_credits', v_existing.fee_credits,
      'vault_item_ids', (
        select coalesce(jsonb_agg(soi.vault_item_id), '[]'::jsonb)
        from public.shipping_order_items soi
        where soi.shipping_order_id = v_existing.id
      ),
      'balance_after', (
        select uc.balance from public.user_credits uc where uc.user_id = v_user_id
      )
    );
  end if;

  select * into v_address
  from public.shipping_addresses sa
  where sa.id = p_address_id
    and sa.user_id = v_user_id;

  if not found then
    raise exception 'ADDRESS_NOT_FOUND';
  end if;

  -- Lock and validate each vault item
  for v_item in
    select *
    from public.user_vault_items uvi
    where uvi.id = any (v_ids)
      and uvi.user_id = v_user_id
    for update
  loop
    if v_item.status = 'shipping_requested' or v_item.status = 'shipped' then
      -- Allow idempotent re-entry only when already on this order path via unique vault_item_id
      raise exception 'VAULT_ITEM_NOT_SHIPPABLE'
        using hint = format('item=%s status=%s', v_item.id, v_item.status);
    end if;
    if v_item.status <> 'vaulted' then
      raise exception 'VAULT_ITEM_NOT_SHIPPABLE'
        using hint = format('item=%s status=%s', v_item.id, v_item.status);
    end if;
    v_item_ids := array_append(v_item_ids, v_item.id);
    v_pull_ids := array_append(v_pull_ids, v_item.pull_id);
  end loop;

  if coalesce(cardinality(v_item_ids), 0) <> v_count then
    raise exception 'VAULT_ITEM_NOT_FOUND';
  end if;

  v_fee := public.default_shipping_fee_credits();

  if v_fee > 0 then
    v_deduct := public.deduct_user_credits(
      v_user_id,
      v_fee,
      p_idempotency_key || ':shipping_fee',
      null,
      jsonb_build_object(
        'transaction_type', 'pack_spend',
        'purpose', 'shipping_fee',
        'address_id', p_address_id::text
      )
    );

    if v_deduct->>'status' = 'error' then
      if v_deduct->>'error_code' = 'INSUFFICIENT_FUNDS' then
        raise exception 'INSUFFICIENT_CREDITS'
          using hint = format('required=%s available=%s', v_fee, coalesce((v_deduct->>'balance_after')::bigint, 0));
      end if;
      raise exception 'DEDUCT_FAILED: %', v_deduct->>'error_code';
    end if;
  end if;

  insert into public.shipping_orders (
    user_id,
    shipping_address_id,
    status,
    fee_credits,
    idempotency_key,
    metadata
  )
  values (
    v_user_id,
    p_address_id,
    'pending',
    v_fee,
    p_idempotency_key,
    jsonb_build_object('item_count', v_count)
  )
  returning id into v_order_id;

  insert into public.shipping_order_items (shipping_order_id, vault_item_id, pull_id)
  select v_order_id, uvi.id, uvi.pull_id
  from public.user_vault_items uvi
  where uvi.id = any (v_item_ids);

  update public.user_vault_items
  set status = 'shipping_requested',
      updated_at = now(),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'shipping_order_id', v_order_id::text
      )
  where id = any (v_item_ids);

  -- Keep legacy vault_fulfillments / mint path in sync when rows exist
  update public.vault_fulfillments
  set fulfillment_status = 'shipment_requested',
      shipping_address = jsonb_build_object(
        'fullName', v_address.recipient_name,
        'line1', v_address.street1,
        'line2', v_address.street2,
        'city', v_address.city,
        'region', v_address.state,
        'postal', v_address.postal_code,
        'country', v_address.country,
        'phone', v_address.phone
      ),
      updated_at = now()
  where pull_id = any (v_pull_ids)
    and fulfillment_status = 'vaulted';

  update public.pull_results
  set mint_status = 'mint_pending',
      mint_last_error = null
  where id = any (v_pull_ids)
    and mint_status in ('mint_deferred', 'mint_skipped_no_wallet');

  return jsonb_build_object(
    'status', 'ok',
    'shipping_order_id', v_order_id,
    'order_status', 'pending',
    'fee_credits', v_fee,
    'vault_item_ids', to_jsonb(v_item_ids),
    'pull_ids', to_jsonb(v_pull_ids),
    'balance_after', (
      select uc.balance from public.user_credits uc where uc.user_id = v_user_id
    )
  );
exception
  when unique_violation then
    select * into v_existing
    from public.shipping_orders so
    where so.user_id = v_user_id
      and so.idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'status', 'already_processed',
        'error_code', 'DUPLICATE_TRANSACTION',
        'shipping_order_id', v_existing.id,
        'order_status', v_existing.status,
        'fee_credits', v_existing.fee_credits,
        'vault_item_ids', (
          select coalesce(jsonb_agg(soi.vault_item_id), '[]'::jsonb)
          from public.shipping_order_items soi
          where soi.shipping_order_id = v_existing.id
        ),
        'balance_after', (
          select uc.balance from public.user_credits uc where uc.user_id = v_user_id
        )
      );
    end if;
    raise;
end;
$$;

revoke all on function public.request_physical_fulfillment from public;
grant execute on function public.request_physical_fulfillment to authenticated;
grant execute on function public.request_physical_fulfillment to service_role;

-- Admin / ops helper: pending → shipped (marks inventory shipped)
create or replace function public.mark_shipping_order_shipped(
  p_order_id uuid,
  p_tracking_number text default null,
  p_carrier text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.shipping_orders%rowtype;
begin
  select * into v_order
  from public.shipping_orders so
  where so.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.status = 'shipped' or v_order.status = 'delivered' then
    return jsonb_build_object(
      'status', 'already_shipped',
      'shipping_order_id', v_order.id
    );
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'ORDER_CANCELLED';
  end if;

  update public.shipping_orders
  set status = 'shipped',
      tracking_number = coalesce(p_tracking_number, tracking_number),
      carrier = coalesce(p_carrier, carrier),
      shipped_at = now(),
      updated_at = now()
  where id = p_order_id;

  update public.user_vault_items uvi
  set status = 'shipped',
      updated_at = now()
  from public.shipping_order_items soi
  where soi.shipping_order_id = p_order_id
    and soi.vault_item_id = uvi.id
    and uvi.status = 'shipping_requested';

  update public.vault_fulfillments vf
  set fulfillment_status = 'shipped',
      updated_at = now()
  from public.shipping_order_items soi
  where soi.shipping_order_id = p_order_id
    and soi.pull_id = vf.pull_id
    and vf.fulfillment_status = 'shipment_requested';

  return jsonb_build_object(
    'status', 'ok',
    'shipping_order_id', p_order_id,
    'order_status', 'shipped'
  );
end;
$$;

revoke all on function public.mark_shipping_order_shipped from public;
grant execute on function public.mark_shipping_order_shipped to service_role;

-- Keep legacy single-pull request_physical_shipment in sync with user_vault_items
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
  v_address_id uuid;
  v_vault_item_id uuid;
  v_idem text;
  v_fulfill jsonb;
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

  -- Prefer new inventory path when vault item exists
  select uvi.id into v_vault_item_id
  from public.user_vault_items uvi
  where uvi.pull_id = p_pull_id
    and uvi.user_id = v_user_id;

  if v_vault_item_id is not null then
    insert into public.shipping_addresses (
      user_id,
      recipient_name,
      street1,
      street2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    )
    values (
      v_user_id,
      trim(p_shipping_address->>'fullName'),
      trim(p_shipping_address->>'line1'),
      nullif(trim(p_shipping_address->>'line2'), ''),
      trim(p_shipping_address->>'city'),
      nullif(trim(coalesce(p_shipping_address->>'region', '')), ''),
      nullif(trim(coalesce(p_shipping_address->>'postal', '')), ''),
      trim(p_shipping_address->>'country'),
      nullif(trim(coalesce(p_shipping_address->>'phone', '')), ''),
      true
    )
    returning id into v_address_id;

    v_idem := 'legacy_ship_' || p_pull_id::text;
    v_fulfill := public.request_physical_fulfillment(
      v_user_id,
      array[v_vault_item_id],
      v_address_id,
      v_idem
    );

    return jsonb_build_object(
      'status', coalesce(v_fulfill->>'status', 'ok'),
      'pull_id', p_pull_id,
      'fulfillment_status', 'shipment_requested',
      'mint_status', coalesce(
        (select pr.mint_status from public.pull_results pr where pr.id = p_pull_id),
        'mint_pending'
      ),
      'shipping_order_id', v_fulfill->>'shipping_order_id'
    );
  end if;

  -- Legacy grail-only path (vault_fulfillments without user_vault_items)
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
