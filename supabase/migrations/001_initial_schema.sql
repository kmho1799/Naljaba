create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  invite_code text not null unique,
  password_hash text not null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (room_id, user_id)
);

create table public.events (
  id uuid primary key default extensions.gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  event_date date not null,
  title text not null check (length(trim(title)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index room_members_user_active_idx on public.room_members(user_id, left_at);
create index room_members_room_active_idx on public.room_members(room_id, left_at);
create index events_room_date_idx on public.events(room_id, event_date) where deleted_at is null;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.events enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_active_room_member(p_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.room_members rm
    where rm.room_id = p_room_id
      and rm.user_id = auth.uid()
      and rm.left_at is null
  );
$$;

create or replace function public.is_room_owner(p_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.owner_id = auth.uid()
  );
$$;

create or replace function public.generate_invite_code()
returns text
language sql
set search_path = public, extensions
as $$
  select translate(replace(encode(extensions.gen_random_bytes(8), 'base64'), '=', ''), '+/', '-_');
$$;

create policy "profiles are visible to signed in users"
on public.profiles for select
to authenticated
using (true);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "active members can read rooms"
on public.rooms for select
to authenticated
using (public.is_active_room_member(id));

create policy "owners can update rooms"
on public.rooms for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "active members can read room members"
on public.room_members for select
to authenticated
using (public.is_active_room_member(room_id));

create policy "active members can update own color"
on public.room_members for update
to authenticated
using (user_id = auth.uid() and public.is_active_room_member(room_id))
with check (user_id = auth.uid());

create policy "active members can read active events"
on public.events for select
to authenticated
using (
  public.is_active_room_member(room_id)
  and deleted_at is null
  and exists (
    select 1
    from public.room_members rm
    where rm.room_id = events.room_id
      and rm.user_id = events.creator_id
      and rm.left_at is null
  )
);

create policy "active members can create own events"
on public.events for insert
to authenticated
with check (
  creator_id = auth.uid()
  and public.is_active_room_member(room_id)
);

create policy "creator or owner can update events"
on public.events for update
to authenticated
using (
  public.is_active_room_member(room_id)
  and (creator_id = auth.uid() or public.is_room_owner(room_id))
)
with check (
  public.is_active_room_member(room_id)
  and (creator_id = auth.uid() or public.is_room_owner(room_id))
);

create or replace function public.create_room(
  p_name text,
  p_password text,
  p_color text
)
returns table(room_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_id uuid;
  v_invite_code text;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if length(trim(p_name)) = 0 then
    raise exception '방 이름을 입력해주세요.';
  end if;

  if length(p_password) < 4 then
    raise exception '방 비밀번호는 4자 이상이어야 합니다.';
  end if;

  loop
    v_invite_code := public.generate_invite_code();
    exit when not exists (select 1 from public.rooms where rooms.invite_code = v_invite_code);
  end loop;

  insert into public.rooms (name, invite_code, password_hash, owner_id)
  values (trim(p_name), v_invite_code, extensions.crypt(p_password, extensions.gen_salt('bf')), v_user_id)
  returning id into v_room_id;

  insert into public.room_members (room_id, user_id, role, color)
  values (v_room_id, v_user_id, 'owner', p_color);

  return query select v_room_id, v_invite_code;
end;
$$;

create or replace function public.get_invite_room(p_invite_code text)
returns table(room_id uuid, room_name text, owner_name text, owner_avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.name, p.display_name, p.avatar_url
  from public.rooms r
  left join public.profiles p on p.id = r.owner_id
  where r.invite_code = p_invite_code
  limit 1;
$$;

create or replace function public.join_room(
  p_invite_code text,
  p_password text,
  p_color text
)
returns table(room_id uuid)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms%rowtype;
  v_existing public.room_members%rowtype;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.';
  end if;

  select * into v_room
  from public.rooms
  where invite_code = p_invite_code;

  if not found then
    raise exception '초대 링크가 올바르지 않습니다.';
  end if;

  if v_room.password_hash <> extensions.crypt(p_password, v_room.password_hash) then
    raise exception '비밀번호가 올바르지 않습니다.';
  end if;

  select * into v_existing
  from public.room_members
  where room_members.room_id = v_room.id
    and room_members.user_id = v_user_id;

  if found then
    update public.room_members
    set left_at = null,
        color = p_color,
        joined_at = coalesce(room_members.joined_at, now())
    where room_members.room_id = v_room.id
      and room_members.user_id = v_user_id;
  else
    insert into public.room_members (room_id, user_id, role, color)
    values (v_room.id, v_user_id, 'member', p_color);
  end if;

  return query select v_room.id;
end;
$$;

create or replace function public.update_my_room_color(
  p_room_id uuid,
  p_color text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_active_room_member(p_room_id) then
    raise exception '방 멤버만 색상을 변경할 수 있습니다.';
  end if;

  update public.room_members
  set color = p_color
  where room_id = p_room_id
    and user_id = auth.uid()
    and left_at is null;
end;
$$;

create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_room_owner(p_room_id) then
    raise exception '방장은 방에서 나갈 수 없습니다.';
  end if;

  if not public.is_active_room_member(p_room_id) then
    raise exception '방 멤버만 나갈 수 있습니다.';
  end if;

  update public.room_members
  set left_at = now()
  where room_id = p_room_id
    and user_id = auth.uid()
    and left_at is null;
end;
$$;

create or replace function public.change_room_password(
  p_room_id uuid,
  p_current_password text,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_room public.rooms%rowtype;
begin
  select * into v_room
  from public.rooms
  where id = p_room_id;

  if not found then
    raise exception '방을 찾을 수 없습니다.';
  end if;

  if v_room.owner_id <> auth.uid() then
    raise exception '방장만 비밀번호를 변경할 수 있습니다.';
  end if;

  if v_room.password_hash <> extensions.crypt(p_current_password, v_room.password_hash) then
    raise exception '현재 비밀번호가 올바르지 않습니다.';
  end if;

  if length(p_new_password) < 4 then
    raise exception '새 비밀번호는 4자 이상이어야 합니다.';
  end if;

  update public.rooms
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = p_room_id;
end;
$$;

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
