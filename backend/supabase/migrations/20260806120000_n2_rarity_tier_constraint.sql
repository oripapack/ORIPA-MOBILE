-- Align pack_pool_items.rarity_tier with N2 pull tiers (MYTHIC / LEGENDARY / EPIC / BASE).
-- Migrates legacy admin labels: Bulk → base, Mid-Tier → epic, Grail → mythic.

update public.pack_pool_items
set rarity_tier = case lower(trim(rarity_tier))
  when 'bulk' then 'base'
  when 'mid-tier' then 'epic'
  when 'mid_tier' then 'epic'
  when 'grail' then 'mythic'
  when 'common' then 'base'
  when 'rare' then 'base'
  when 'uncommon' then 'base'
  else lower(trim(rarity_tier))
end
where rarity_tier is not null;

alter table public.pack_pool_items
  drop constraint if exists pack_pool_items_rarity_tier_check;

alter table public.pack_pool_items
  add constraint pack_pool_items_rarity_tier_check
  check (rarity_tier is null or rarity_tier in ('mythic', 'legendary', 'epic', 'base'));

comment on column public.pack_pool_items.rarity_tier is
  'N2 pull tier for odds disclosure: mythic | legendary | epic | base.';
