-- Pull Hub — provably fair pull outcomes + on-chain Digital Twin provenance (Base).

-- Linked wallet for NFT custody (gasless mint sends here).
alter table public.profiles
  add column if not exists wallet_address text;

comment on column public.profiles.wallet_address is
  'User-controlled EVM address for Digital Twin delivery (Base). Nullable until linked.';

-- Immutable outcome row per pull (service role / Edge Functions insert).
create table public.pull_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pack_version_id uuid,
  seed_pair_id uuid,
  client_seed text not null,
  nonce int not null,
  hashed_server_seed text not null,
  revealed_server_seed text not null,
  digest_hex text not null,
  roll_value bigint,
  won_item_id text not null,
  card_name text not null,
  serial_number text not null unique,
  -- Legal / provenance: wall-clock time of the resolved pull (metadata "timestamp").
  provenance_at timestamptz not null default now(),
  mint_status text not null default 'mint_pending'
    check (mint_status in ('mint_pending', 'mint_completed', 'mint_skipped_no_wallet', 'mint_failed')),
  mint_last_error text,
  mint_attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index pull_results_user_id_idx on public.pull_results (user_id);
create index pull_results_mint_pending_idx
  on public.pull_results (mint_status, created_at)
  where mint_status = 'mint_pending';

comment on table public.pull_results is
  'Immutable pull log. Minting updates mint_* fields only (via service role).';
comment on column public.pull_results.digest_hex is
  'Fairness digest (e.g. HMAC-SHA256 hex) tying outcome to seeds.';
comment on column public.pull_results.serial_number is
  'Unique physical vault asset id for the won item.';

-- One twin per pull; chain fields filled after successful mint.
create table public.digital_twins (
  id uuid primary key default gen_random_uuid(),
  pull_id uuid not null references public.pull_results (id) on delete restrict,
  chain_id int not null default 8453,
  contract_address text not null,
  token_id text not null,
  tx_hash text not null,
  owner_wallet text not null,
  block_number bigint,
  block_timestamp timestamptz,
  metadata_snapshot jsonb,
  mint_provider text,
  created_at timestamptz not null default now(),
  unique (pull_id)
);

create unique index digital_twins_contract_token_uidx
  on public.digital_twins (chain_id, contract_address, token_id);

create index digital_twins_owner_wallet_idx on public.digital_twins (owner_wallet);

comment on table public.digital_twins is
  'On-chain provenance for a pull (Base by default).';

alter table public.pull_results enable row level security;
alter table public.digital_twins enable row level security;

create policy "pull_results_select_own"
  on public.pull_results
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "digital_twins_select_own"
  on public.digital_twins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pull_results pr
      where pr.id = digital_twins.pull_id
        and pr.user_id = auth.uid()
    )
  );

-- No client inserts/updates on these tables; Edge Functions use the service role.
