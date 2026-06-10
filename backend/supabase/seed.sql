-- Mock pack for weighted pulls (1% grail mints on-chain, 99% standard does not).
-- Pack version id for execute-pull: a0000000-0000-4000-8000-000000000002

insert into public.pack_definitions (id, slug, name)
values (
  'a0000000-0000-4000-8000-000000000001',
  'mock-rarity-demo',
  'Mock Rarity Demo Pack'
)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name;

insert into public.pack_versions (
  id,
  pack_definition_id,
  label,
  is_active,
  credit_cost
)
values (
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  'v1',
  true,
  100
)
on conflict (id) do update
set pack_definition_id = excluded.pack_definition_id,
    label = excluded.label,
    is_active = excluded.is_active,
    credit_cost = excluded.credit_cost;

insert into public.pack_pool_items (
  id,
  pack_version_id,
  item_id,
  card_name,
  weight,
  sort_order,
  should_mint
)
values
  (
    'a0000000-0000-4000-8000-000000000011',
    'a0000000-0000-4000-8000-000000000002',
    'grail-1pct',
    'Grail Card (1%)',
    1,
    0,
    true
  ),
  (
    'a0000000-0000-4000-8000-000000000012',
    'a0000000-0000-4000-8000-000000000002',
    'bulk-99pct',
    'Standard Hit (99%)',
    99,
    1,
    false
  )
on conflict (id) do update
set pack_version_id = excluded.pack_version_id,
    item_id = excluded.item_id,
    card_name = excluded.card_name,
    weight = excluded.weight,
    sort_order = excluded.sort_order,
    should_mint = excluded.should_mint;
