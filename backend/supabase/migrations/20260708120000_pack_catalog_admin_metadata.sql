-- Extend catalog schema so the internal admin tool can persist full pack metadata.
-- All additions are nullable / idempotent so existing rows and RLS are untouched.

-- pack_definitions: presentation fields
alter table public.pack_definitions
  add column if not exists subheader text,
  add column if not exists cover_image_url text;

-- pack_versions: sale parameter
alter table public.pack_versions
  add column if not exists total_inventory_stock bigint;

-- pack_pool_items: card presentation + rarity
alter table public.pack_pool_items
  add column if not exists card_image_url text,
  add column if not exists rarity_tier text;

-- Optional but recommended: constrain rarity values (nullable for existing rows)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pack_pool_items_rarity_tier_check'
  ) then
    alter table public.pack_pool_items
      add constraint pack_pool_items_rarity_tier_check
      check (rarity_tier is null or rarity_tier in ('Bulk','Mid-Tier','Grail'));
  end if;
end $$;

comment on column public.pack_versions.total_inventory_stock is
  'Total sellable stock for this pack version (set by admin tool).';
comment on column public.pack_pool_items.rarity_tier is
  'Bulk | Mid-Tier | Grail (admin/display metadata).';
