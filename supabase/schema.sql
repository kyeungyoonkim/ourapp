-- Supabase SQL Editor에서 한 번 실행하세요.
-- Dashboard → SQL → New query → 붙여넣기 → Run

create table if not exists public.couple_data (
  room_code text primary key,
  payload jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.couple_data enable row level security;

create policy "couple_data_read"
  on public.couple_data for select
  using (true);

create policy "couple_data_write"
  on public.couple_data for insert
  with check (true);

create policy "couple_data_update"
  on public.couple_data for update
  using (true)
  with check (true);

-- Realtime: Table Editor → couple_data → Enable realtime (또는 아래)
alter publication supabase_realtime add table public.couple_data;
