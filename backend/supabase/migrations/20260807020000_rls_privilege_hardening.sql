-- Phase 5: RLS & privilege hardening for ledger, vault, and shipping.

-- ---------------------------------------------------------------------------
-- Revoke direct client access to low-level ledger mutators.
-- Mutations must go through security-definer RPCs (process_atomic_pull,
-- process_instant_trade_in, request_physical_fulfillment, credit_top_up_stripe).
-- ---------------------------------------------------------------------------
revoke all on function public.deduct_user_credits(
  text, bigint, text, uuid, jsonb
) from public;
revoke all on function public.deduct_user_credits(
  text, bigint, text, uuid, jsonb
) from anon;
revoke all on function public.deduct_user_credits(
  text, bigint, text, uuid, jsonb
) from authenticated;
grant execute on function public.deduct_user_credits(
  text, bigint, text, uuid, jsonb
) to service_role;

revoke all on function public.credit_user_credits(
  text, bigint, text, uuid, jsonb
) from public;
revoke all on function public.credit_user_credits(
  text, bigint, text, uuid, jsonb
) from anon;
revoke all on function public.credit_user_credits(
  text, bigint, text, uuid, jsonb
) from authenticated;
grant execute on function public.credit_user_credits(
  text, bigint, text, uuid, jsonb
) to service_role;

-- Defense in depth: even if grants leak, reject cross-user ledger writes
-- when a JWT subject is present and does not match p_user_id.
create or replace function public.deduct_user_credits(
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
  v_caller text;
  v_balance bigint;
  v_existing public.credit_transactions%rowtype;
  v_tx_id uuid;
  v_balance_after bigint;
begin
  v_caller := public.auth_user_id();
  if v_caller is not null and length(trim(v_caller)) > 0 and v_caller <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  if p_user_id is null or length(trim(p_user_id)) = 0 then
    raise exception 'USER_ID_REQUIRED';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

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
        select uc.balance
        from public.user_credits uc
        where uc.user_id = p_user_id
      ),
      'amount', abs(v_existing.amount),
      'reference_id', v_existing.reference_id
    );
  end if;

  insert into public.profiles (id)
  values (p_user_id)
  on conflict (id) do nothing;

  insert into public.user_credits (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select uc.balance into v_balance
  from public.user_credits uc
  where uc.user_id = p_user_id
  for update;

  if coalesce(v_balance, 0) < p_amount then
    return jsonb_build_object(
      'status', 'error',
      'error_code', 'INSUFFICIENT_FUNDS',
      'balance_after', coalesce(v_balance, 0),
      'required', p_amount
    );
  end if;

  update public.user_credits
  set balance = balance - p_amount,
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
    -p_amount,
    coalesce(nullif(p_metadata->>'transaction_type', ''), 'pack_spend'),
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
        select uc.balance
        from public.user_credits uc
        where uc.user_id = p_user_id
      ),
      'amount', abs(v_existing.amount),
      'reference_id', v_existing.reference_id
    );
end;
$$;

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
  v_caller text;
  v_existing public.credit_transactions%rowtype;
  v_balance_after bigint;
  v_tx_id uuid;
  v_type text;
begin
  v_caller := public.auth_user_id();
  if v_caller is not null and length(trim(v_caller)) > 0 and v_caller <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

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

revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from public;
revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from anon;
revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from authenticated;
grant execute on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) to service_role;

revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from public;
revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from anon;
revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from authenticated;
grant execute on function public.credit_user_credits(text, bigint, text, uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Re-assert RLS is on; drop any accidental client write policies.
-- Identity uses Clerk JWT sub via public.auth_user_id() (not auth.uid()).
-- ---------------------------------------------------------------------------
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.user_vault_items enable row level security;
alter table public.shipping_addresses enable row level security;
alter table public.shipping_orders enable row level security;
alter table public.shipping_order_items enable row level security;

drop policy if exists "user_credits_insert_own" on public.user_credits;
drop policy if exists "user_credits_update_own" on public.user_credits;
drop policy if exists "user_credits_delete_own" on public.user_credits;

drop policy if exists "credit_transactions_insert_own" on public.credit_transactions;
drop policy if exists "credit_transactions_update_own" on public.credit_transactions;
drop policy if exists "credit_transactions_delete_own" on public.credit_transactions;

drop policy if exists "user_vault_items_insert_own" on public.user_vault_items;
drop policy if exists "user_vault_items_update_own" on public.user_vault_items;
drop policy if exists "user_vault_items_delete_own" on public.user_vault_items;

drop policy if exists "shipping_orders_insert_own" on public.shipping_orders;
drop policy if exists "shipping_orders_update_own" on public.shipping_orders;
drop policy if exists "shipping_orders_delete_own" on public.shipping_orders;

drop policy if exists "shipping_order_items_insert_own" on public.shipping_order_items;
drop policy if exists "shipping_order_items_update_own" on public.shipping_order_items;
drop policy if exists "shipping_order_items_delete_own" on public.shipping_order_items;

-- Ensure select-own policies exist (idempotent recreate)
drop policy if exists "user_credits_select_own" on public.user_credits;
create policy "user_credits_select_own"
  on public.user_credits
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "credit_transactions_select_own" on public.credit_transactions;
create policy "credit_transactions_select_own"
  on public.credit_transactions
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "user_vault_items_select_own" on public.user_vault_items;
create policy "user_vault_items_select_own"
  on public.user_vault_items
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "shipping_addresses_select_own" on public.shipping_addresses;
create policy "shipping_addresses_select_own"
  on public.shipping_addresses
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "shipping_addresses_insert_own" on public.shipping_addresses;
create policy "shipping_addresses_insert_own"
  on public.shipping_addresses
  for insert
  to authenticated
  with check (public.auth_user_id() = user_id);

drop policy if exists "shipping_addresses_update_own" on public.shipping_addresses;
create policy "shipping_addresses_update_own"
  on public.shipping_addresses
  for update
  to authenticated
  using (public.auth_user_id() = user_id)
  with check (public.auth_user_id() = user_id);

drop policy if exists "shipping_addresses_delete_own" on public.shipping_addresses;
create policy "shipping_addresses_delete_own"
  on public.shipping_addresses
  for delete
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "shipping_orders_select_own" on public.shipping_orders;
create policy "shipping_orders_select_own"
  on public.shipping_orders
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

drop policy if exists "shipping_order_items_select_own" on public.shipping_order_items;
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

-- Ops transitions remain service_role only
revoke all on function public.mark_shipping_order_shipped(uuid, text, text) from public;
revoke all on function public.mark_shipping_order_shipped(uuid, text, text) from authenticated;
grant execute on function public.mark_shipping_order_shipped(uuid, text, text) to service_role;

revoke all on function public.sync_vault_item_shipped(uuid) from public;
revoke all on function public.sync_vault_item_shipped(uuid) from authenticated;
grant execute on function public.sync_vault_item_shipped(uuid) to service_role;

revoke all on function public.credit_top_up_stripe(text, bigint, text, text) from public;
revoke all on function public.credit_top_up_stripe(text, bigint, text, text) from authenticated;
grant execute on function public.credit_top_up_stripe(text, bigint, text, text) to service_role;

comment on table public.credit_transactions is
  'Append-only ledger. Clients SELECT own rows only; writes via security-definer RPCs.';
comment on table public.user_vault_items is
  'Vault inventory. Clients SELECT own rows only; status changes via RPCs / service role.';
comment on table public.shipping_orders is
  'Physical fulfillment orders. Clients SELECT own rows; inserts via request_physical_fulfillment.';
