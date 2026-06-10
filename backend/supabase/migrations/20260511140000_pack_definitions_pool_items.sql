-- Pack catalog: definitions, versioned pools, weighted line items (for provably fair pulls).

create table public.pack_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.pack_versions (
  id uuid primary key default gen_random_uuid(),
  pack_definition_id uuid not null references public.pack_definitions (id) on delete cascade,
  label text not null default 'v1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (pack_definition_id, label)
);

create index pack_versions_definition_idx on public.pack_versions (pack_definition_id);
create index pack_versions_active_idx on public.pack_versions (pack_definition_id)
  where is_active = true;

create table public.pack_pool_items (
  id uuid primary key default gen_random_uuid(),
  pack_version_id uuid not null references public.pack_versions (id) on delete cascade,
  item_id text not null,
  card_name text not null,
  weight bigint not null check (weight >= 1),
  sort_order int not null default 0,
  unique (pack_version_id, item_id)
);

create index pack_pool_items_version_sort_idx
  on public.pack_pool_items (pack_version_id, sort_order, item_id);

comment on table public.pack_definitions is 'Sellable pack family (slug is stable API key).';
comment on table public.pack_versions is 'Immutable-ish pool snapshot; pulls reference this id.';
comment on table public.pack_pool_items is 'Weighted inventory lines; sum(weight) defines the roll space.';
comment on column public.pack_pool_items.weight is 'Positive integer weight (e.g. 1 and 99 for 1% / 99%).';

alter table public.pack_definitions enable row level security;
alter table public.pack_versions enable row level security;
alter table public.pack_pool_items enable row level security;

create policy "pack_definitions_select_public"
  on public.pack_definitions
  for select
  to anon, authenticated
  using (true);

create policy "pack_versions_select_public"
  on public.pack_versions
  for select
  to anon, authenticated
  using (true);

create policy "pack_pool_items_select_public"
  on public.pack_pool_items
  for select
  to anon, authenticated
  using (true);

-- Optional FK: nullable pack_version_id on existing rows must be null or valid.
alter table public.pull_results
  add constraint pull_results_pack_version_id_fkey
  foreign key (pack_version_id) references public.pack_versions (id)
  on delete restrict;
