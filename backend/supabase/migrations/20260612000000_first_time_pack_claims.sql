-- First-time pack claims (one per user per pack version). Referenced by src/lib/firstTimePack.ts.

create table public.first_time_pack_claims (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles (id) on delete cascade,
  pack_version_id uuid not null references public.pack_versions (id) on delete cascade,
  claimed_at timestamptz not null default now(),
  unique (user_id, pack_version_id)
);

create index first_time_pack_claims_user_id_idx
  on public.first_time_pack_claims (user_id);

alter table public.first_time_pack_claims enable row level security;

create policy "first_time_pack_claims_select_own"
  on public.first_time_pack_claims
  for select
  to authenticated
  using (public.auth_user_id() = user_id);

create policy "first_time_pack_claims_insert_own"
  on public.first_time_pack_claims
  for insert
  to authenticated
  with check (public.auth_user_id() = user_id);
