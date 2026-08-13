-- KNOWMATE V2 DATABASE
-- Run this entire script in Supabase SQL Editor.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  password_hash text not null,
  status text not null default 'waiting',
  player1_name text not null,
  player2_name text,
  player1_id text not null,
  player2_id text,
  current_question integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_no integer not null,
  player_id text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  unique(room_id, question_no, player_id)
);

alter table public.rooms enable row level security;
alter table public.answers enable row level security;

-- MVP policies. They allow the anonymous browser client to create/read/update rooms
-- and answers. Before a public launch, replace these with authenticated-user policies.
drop policy if exists rooms_select on public.rooms;
drop policy if exists rooms_insert on public.rooms;
drop policy if exists rooms_update on public.rooms;
drop policy if exists answers_select on public.answers;
drop policy if exists answers_insert on public.answers;

create policy rooms_select on public.rooms for select using (true);
create policy rooms_insert on public.rooms for insert with check (true);
create policy rooms_update on public.rooms for update using (true) with check (true);
create policy answers_select on public.answers for select using (true);
create policy answers_insert on public.answers for insert with check (true);

alter table public.rooms replica identity full;
alter table public.answers replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.answers;
exception when duplicate_object then null;
end $$;
