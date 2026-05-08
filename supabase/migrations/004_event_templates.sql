create table public.event_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) > 0),
  description text,
  start_time  time,
  end_time    time,
  created_at  timestamptz not null default now(),
  check (
    start_time is null
    or end_time is null
    or end_time >= start_time
  )
);

alter table public.event_templates enable row level security;

create policy "본인 템플릿만 접근"
  on public.event_templates
  for all
  using (auth.uid() = user_id);

create index on public.event_templates (user_id, created_at);
