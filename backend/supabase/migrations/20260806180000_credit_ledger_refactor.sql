-- Phase 2: Credit ledger refactor — per-user idempotency, metadata, deduct_user_credits RPC.

-- ---------------------------------------------------------------------------
-- credit_transactions: align columns + per-user idempotency
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'credit_transactions'
      and column_name = 'type'
  ) then
    alter table public.credit_transactions rename column type to transaction_type;
  end if;
end $$;

alter table public.credit_transactions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.credit_transactions
set metadata = metadata || jsonb_build_object('description', description)
where description is not null
  and description <> ''
  and not (metadata ? 'description');

alter table public.credit_transactions
  drop column if exists description;

alter table public.credit_transactions
  drop constraint if exists credit_transactions_type_check;

alter table public.credit_transactions
  drop constraint if exists credit_transactions_idempotency_key_key;

create unique index if not exists credit_transactions_user_idempotency_uidx
  on public.credit_transactions (user_id, idempotency_key);

alter table public.credit_transactions
  drop constraint if exists credit_transactions_transaction_type_check;

alter table public.credit_transactions
  add constraint credit_transactions_transaction_type_check
  check (
    transaction_type in ('top_up', 'pack_spend', 'bulk_pack_spend', 'refund')
  );

comment on column public.credit_transactions.transaction_type is
  'Ledger line category: top_up | pack_spend | bulk_pack_spend | refund.';

comment on column public.credit_transactions.metadata is
  'Structured audit payload (pack_version_id, batch_id, description, etc.).';

-- ---------------------------------------------------------------------------
-- Atomic debit helper (positive p_amount = credits to subtract)
-- ---------------------------------------------------------------------------
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
  v_balance bigint;
  v_existing public.credit_transactions%rowtype;
  v_tx_id uuid;
  v_balance_after bigint;
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

revoke all on function public.deduct_user_credits from public;
grant execute on function public.deduct_user_credits to authenticated;
grant execute on function public.deduct_user_credits to service_role;

-- ---------------------------------------------------------------------------
-- Stripe top-up: transaction_type + metadata
-- ---------------------------------------------------------------------------
create or replace function public.credit_top_up_stripe(
  p_user_id text,
  p_amount bigint,
  p_idempotency_key text,
  p_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
  v_existing public.credit_transactions%rowtype;
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

  select * into v_existing
  from public.credit_transactions ct
  where ct.user_id = p_user_id
    and ct.idempotency_key = p_idempotency_key;

  if found then
    select uc.balance into v_balance
    from public.user_credits uc
    where uc.user_id = p_user_id;

    return jsonb_build_object(
      'status', 'already_applied',
      'error_code', 'DUPLICATE_TRANSACTION',
      'idempotency_key', p_idempotency_key,
      'balance', coalesce(v_balance, 0)
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
  returning balance into v_balance;

  insert into public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    idempotency_key,
    metadata
  )
  values (
    p_user_id,
    p_amount,
    'top_up',
    p_idempotency_key,
    jsonb_build_object('description', coalesce(p_description, 'Stripe checkout'))
  );

  return jsonb_build_object(
    'status', 'ok',
    'balance', v_balance,
    'idempotency_key', p_idempotency_key
  );
exception
  when unique_violation then
    select uc.balance into v_balance
    from public.user_credits uc
    where uc.user_id = p_user_id;

    return jsonb_build_object(
      'status', 'already_applied',
      'error_code', 'DUPLICATE_TRANSACTION',
      'idempotency_key', p_idempotency_key,
      'balance', coalesce(v_balance, 0)
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- Atomic pull: debit via deduct_user_credits + link reference_id
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
  v_existing_pull uuid;
  v_deduct jsonb;
  v_tx_id uuid;
  v_balance_after bigint;
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
          select uc.balance
          from public.user_credits uc
          where uc.user_id = v_user_id
        )
      )
      from public.pull_results pr
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
          'balance_after', (v_deduct->>'balance_after')::bigint
        )
        from public.pull_results pr
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
    'transaction_id', v_tx_id
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
          'roll_value', pr.roll_value
        )
        from public.pull_results pr
        where pr.id = v_existing_pull
      );
    end if;
    raise;
end;
$$;

revoke all on function public.process_atomic_pull from public;
grant execute on function public.process_atomic_pull to authenticated;
grant execute on function public.process_atomic_pull to service_role;
