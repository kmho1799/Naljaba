create or replace function public.delete_event(
  p_room_id uuid,
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if not public.is_active_room_member(p_room_id) then
    raise exception '방 멤버만 일정을 삭제할 수 있습니다.';
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
    and room_id = p_room_id
    and deleted_at is null;

  if not found then
    raise exception '삭제할 일정을 찾을 수 없습니다.';
  end if;

  if v_event.creator_id <> auth.uid() and not public.is_room_owner(p_room_id) then
    raise exception '일정을 삭제할 권한이 없습니다.';
  end if;

  update public.events
  set deleted_at = now(),
      updated_at = now()
  where id = p_event_id
    and room_id = p_room_id
    and deleted_at is null;
end;
$$;
