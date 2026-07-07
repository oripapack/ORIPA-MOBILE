-- Add genre to pack_definitions for catalog filtering (TCG niche / category).
-- Safe for existing rows: NOT NULL + DEFAULT applies to all current rows on add (PG 11+).

alter table public.pack_definitions
  add column if not exists genre text not null default 'multi';

comment on column public.pack_definitions.genre is
  'TCG niche key (e.g. pokemon, one_piece, yugioh, sports, multi).';

create index if not exists pack_definitions_genre_idx on public.pack_definitions (genre);
