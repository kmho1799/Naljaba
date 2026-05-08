alter table public.events
add column if not exists start_time time,
add column if not exists end_time time;

alter table public.events
drop constraint if exists events_time_order_check;

alter table public.events
add constraint events_time_order_check
check (
  start_time is null
  or end_time is null
  or end_time >= start_time
);
