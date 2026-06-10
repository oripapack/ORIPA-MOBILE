-- Pull Hub core engine: Clerk identity (JWT sub), credits ledger, atomic pull RPC, tiered mint flags.

-- ---------------------------------------------------------------------------
-- Clerk / third-party JWT identity helper
-- ---------------------------------------------------------------------------
create or replace function public.auth_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>'sub', ''),
    nullif(current_setting('request.jwt.claims', true)::json->>'id', '')
  )::text;
$$;

comment on function public.auth_user_id() is
  'Clerk user id (JWT sub) for native Supabase third-party auth.';

-- ---------------------------------------------------------------------------
-- Profiles: primary key = Clerk sub (text), decoupled from auth.users
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_id_fkey;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

alter table public.pull_results drop constraint if exists pull_results_user_id_fkey;

alter table public.pull_results
  alter column user_id type text using user_id::text;

alter table public.profiles
  alter column id type text using id::text;

alter table public.profiles
  drop constraint if exists profiles_pkey;

alter table public.profiles
  add constraint profiles_pkey primary key (id);

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (public.auth_user_id() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (public.auth_user_id() = id)
  with check (public.auth_user_id() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (public.auth_user_id() = id);

-- ---------------------------------------------------------------------------
-- Pull results / digital twins RLS (Clerk sub)
-- ---------------------------------------------------------------------------
drop policy if exists "pull_results_select_own" on public.pull_results;
drop policy if exists "digital_twins_select_own" on public.digital_twins;

create policy "pull_results_select_own"
  on public.pull_results
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

create policy "digital_twins_select_own"
  on public.digital_twins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pull_results pr
      where pr.id = digital_twins.pull_id
        and pr.user_id = public.auth_user_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Pack economics + tiered mint catalog
-- ---------------------------------------------------------------------------
alter table public.pack_versions
  add column if not exists credit_cost bigint not null default 100
    check (credit_cost > 0);

comment on column public.pack_versions.credit_cost is
  'Credits debited per open for this pack version.';

alter table public.pack_pool_items
  add column if not exists should_mint boolean not null default false;

comment on column public.pack_pool_items.should_mint is
  'When true, a win on this line may trigger gasless Digital Twin mint on Base.';

alter table public.pull_results
  drop constraint if exists pull_results_mint_status_check;

alter table public.pull_results
  add constraint pull_results_mint_status_check
  check (
    mint_status in (
      'mint_pending',
      'mint_completed',
      'mint_skipped_no_wallet',
      'mint_skipped_low_tier',
      'mint_failed'
    )
  );

-- ---------------------------------------------------------------------------
-- Credits ledger
-- ---------------------------------------------------------------------------
create table public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public.profiles (id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create trigger user_credits_set_updated_at
  before update on public.user_credits
  for each row
  execute function public.set_updated_at();

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  amount bigint not null,
  type text not null check (type in ('top_up', 'pack_spend', 'refund')),
  idempotency_key text not null unique,
  description text,
  reference_id uuid references public.pull_results (id) on delete set null,
  created_at timestamptz not null default now()
);

create index credit_transactions_user_id_idx on public.credit_transactions (user_id, created_at desc);

alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

create policy "user_credits_select_own"
  on public.user_credits
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

create policy "credit_transactions_select_own"
  on public.credit_transactions
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

-- ---------------------------------------------------------------------------
-- Atomic pull: debit credits + ledger + pull_results in one transaction
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
  v_wallet text;
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
    select nullif(trim(p.wallet_address), '')
    into v_wallet
    from public.profiles p
    where p.id = v_user_id;

    if v_wallet is null or v_wallet !~ '^0x[a-fA-F0-9]{40}$' then
      v_mint_status := 'mint_skipped_no_wallet';
    else
      v_mint_status := 'mint_pending';
    end if;
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

revoke all on function public.process_atomic_pull from public;
grant execute on function public.process_atomic_pull to authenticated;
grant execute on function public.process_atomic_pull to service_role;

-- ---------------------------------------------------------------------------
-- Stripe top-up (service role / webhook only)
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
  where ct.idempotency_key = p_idempotency_key;

  if found then
    select uc.balance into v_balance
    from public.user_credits uc
    where uc.user_id = p_user_id;

    return jsonb_build_object(
      'status', 'already_applied',
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
    type,
    idempotency_key,
    description
  )
  values (
    p_user_id,
    p_amount,
    'top_up',
    p_idempotency_key,
    coalesce(p_description, 'Stripe checkout')
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
      'idempotency_key', p_idempotency_key,
      'balance', coalesce(v_balance, 0)
    );
end;
$$;

revoke all on function public.credit_top_up_stripe from public;
grant execute on function public.credit_top_up_stripe to service_role;
