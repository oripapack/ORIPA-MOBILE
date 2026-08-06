-- Pull Hub seed catalog: 3 live packs with N2 tier pools (provably fair weights).
-- Catalog ids map via shared/api/catalogLive.ts → pack_versions.id

-- ── Welcome Pack (budget onboarding) ─────────────────────────────────────
insert into public.pack_definitions (id, slug, name, genre)
values (
  'a0000000-0000-4000-8000-000000000001',
  'welcome-pack',
  'Welcome Pack',
  'multi'
)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    genre = excluded.genre;

insert into public.pack_versions (
  id,
  pack_definition_id,
  label,
  is_active,
  credit_cost,
  total_inventory_stock
)
values (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'v1',
  true,
  500,
  50000
)
on conflict (id) do update
set pack_definition_id = excluded.pack_definition_id,
    label = excluded.label,
    is_active = excluded.is_active,
    credit_cost = excluded.credit_cost,
    total_inventory_stock = excluded.total_inventory_stock;

insert into public.pack_pool_items (
  id,
  pack_version_id,
  item_id,
  card_name,
  weight,
  sort_order,
  should_mint,
  rarity_tier
)
values
  (
    'a0000000-0000-4000-8000-000000000011',
    'a0000000-0000-4000-8000-000000000002',
    'welcome-mythic-holo',
    'Secret Rare Holo (Welcome Chase)',
    1,
    0,
    false,
    'mythic'
  ),
  (
    'a0000000-0000-4000-8000-000000000012',
    'a0000000-0000-4000-8000-000000000002',
    'welcome-legendary-fa',
    'Full Art Supporter',
    4,
    1,
    false,
    'legendary'
  ),
  (
    'a0000000-0000-4000-8000-000000000013',
    'a0000000-0000-4000-8000-000000000002',
    'welcome-epic-rare',
    'Holo Rare',
    11,
    2,
    false,
    'epic'
  ),
  (
    'a0000000-0000-4000-8000-000000000014',
    'a0000000-0000-4000-8000-000000000002',
    'welcome-base-standard',
    'Standard Hit',
    184,
    3,
    false,
    'base'
  )
on conflict (id) do update
set pack_version_id = excluded.pack_version_id,
    item_id = excluded.item_id,
    card_name = excluded.card_name,
    weight = excluded.weight,
    sort_order = excluded.sort_order,
    should_mint = excluded.should_mint,
    rarity_tier = excluded.rarity_tier;

-- ── Grail Edition (premium mythic chase) ─────────────────────────────────
insert into public.pack_definitions (id, slug, name, genre)
values (
  'a0000000-0000-4000-8000-000000000003',
  'grail-edition',
  'Grail Edition',
  'pokemon'
)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    genre = excluded.genre;

insert into public.pack_versions (
  id,
  pack_definition_id,
  label,
  is_active,
  credit_cost,
  total_inventory_stock
)
values (
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000003',
  'v1',
  true,
  5000,
  12000
)
on conflict (id) do update
set pack_definition_id = excluded.pack_definition_id,
    label = excluded.label,
    is_active = excluded.is_active,
    credit_cost = excluded.credit_cost,
    total_inventory_stock = excluded.total_inventory_stock;

insert into public.pack_pool_items (
  id,
  pack_version_id,
  item_id,
  card_name,
  weight,
  sort_order,
  should_mint,
  rarity_tier
)
values
  (
    'a0000000-0000-4000-8000-000000000021',
    'a0000000-0000-4000-8000-000000000004',
    'grail-mythic-umbreon-alt',
    'Umbreon VMAX Alt Art',
    1,
    0,
    true,
    'mythic'
  ),
  (
    'a0000000-0000-4000-8000-000000000022',
    'a0000000-0000-4000-8000-000000000004',
    'grail-legendary-rayquaza',
    'Rayquaza VMAX Alt Art',
    4,
    1,
    true,
    'legendary'
  ),
  (
    'a0000000-0000-4000-8000-000000000023',
    'a0000000-0000-4000-8000-000000000004',
    'grail-epic-gold',
    'Gold Rare VSTAR',
    11,
    2,
    false,
    'epic'
  ),
  (
    'a0000000-0000-4000-8000-000000000024',
    'a0000000-0000-4000-8000-000000000004',
    'grail-base-v',
    'Standard V / EX Hit',
    184,
    3,
    false,
    'base'
  )
on conflict (id) do update
set pack_version_id = excluded.pack_version_id,
    item_id = excluded.item_id,
    card_name = excluded.card_name,
    weight = excluded.weight,
    sort_order = excluded.sort_order,
    should_mint = excluded.should_mint,
    rarity_tier = excluded.rarity_tier;

-- ── Charizard Chase (Obsidian Flames premium) ────────────────────────────
insert into public.pack_definitions (id, slug, name, genre)
values (
  'a0000000-0000-4000-8000-000000000005',
  'charizard-chase',
  'Charizard Chase',
  'pokemon'
)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    genre = excluded.genre;

insert into public.pack_versions (
  id,
  pack_definition_id,
  label,
  is_active,
  credit_cost,
  total_inventory_stock
)
values (
  'a0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000005',
  'v1',
  true,
  6000,
  8000
)
on conflict (id) do update
set pack_definition_id = excluded.pack_definition_id,
    label = excluded.label,
    is_active = excluded.is_active,
    credit_cost = excluded.credit_cost,
    total_inventory_stock = excluded.total_inventory_stock;

insert into public.pack_pool_items (
  id,
  pack_version_id,
  item_id,
  card_name,
  weight,
  sort_order,
  should_mint,
  rarity_tier
)
values
  (
    'a0000000-0000-4000-8000-000000000031',
    'a0000000-0000-4000-8000-000000000006',
    'charizard-mythic-sar',
    'Charizard ex SAR',
    1,
    0,
    true,
    'mythic'
  ),
  (
    'a0000000-0000-4000-8000-000000000032',
    'a0000000-0000-4000-8000-000000000006',
    'charizard-legendary-iron-hands',
    'Iron Hands ex Alt Art',
    4,
    1,
    true,
    'legendary'
  ),
  (
    'a0000000-0000-4000-8000-000000000033',
    'a0000000-0000-4000-8000-000000000006',
    'charizard-epic-trainer',
    'Iono Full Art',
    11,
    2,
    false,
    'epic'
  ),
  (
    'a0000000-0000-4000-8000-000000000034',
    'a0000000-0000-4000-8000-000000000006',
    'charizard-base-hit',
    'Obsidian Flames Rare',
    184,
    3,
    false,
    'base'
  )
on conflict (id) do update
set pack_version_id = excluded.pack_version_id,
    item_id = excluded.item_id,
    card_name = excluded.card_name,
    weight = excluded.weight,
    sort_order = excluded.sort_order,
    should_mint = excluded.should_mint,
    rarity_tier = excluded.rarity_tier;
