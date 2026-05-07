import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  CalendarEvent,
  Profile,
  Room,
  RoomDetail,
  RoomListItem,
  RoomMember
} from "@/lib/types/database";
import { todayKey } from "@/lib/date";

type MembershipWithRoom = {
  room_id: string;
  role: "owner" | "member";
  color: string;
  rooms: Room;
};

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await requireUser();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, email, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getRooms(): Promise<RoomListItem[]> {
  const supabase = await createClient();
  const user = await requireUser();
  if (!supabase) return [];

  const { data: memberships, error } = await supabase
    .from("room_members")
    .select("room_id, role, color, rooms(id, name, invite_code, owner_id, created_at, updated_at)")
    .eq("user_id", user.id)
    .is("left_at", null)
    .order("joined_at", { ascending: false });

  if (error) throw error;

  const rooms = await Promise.all(
    ((memberships || []) as unknown as MembershipWithRoom[]).map(async (membership) => {
      const room = membership.rooms;
      const [membersResult, eventsResult] = await Promise.all([
        getRoomMembers(room.id),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("room_id", room.id)
          .is("deleted_at", null)
          .gte("event_date", todayKey())
      ]);

      return {
        ...room,
        my_role: membership.role,
        my_color: membership.color,
        members: membersResult,
        upcoming_event_count: eventsResult.count || 0
      } satisfies RoomListItem;
    })
  );

  return rooms;
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("room_members")
    .select("room_id, user_id, role, color, joined_at, left_at, profiles(id, display_name, avatar_url, email, created_at, updated_at)")
    .eq("room_id", roomId)
    .is("left_at", null)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as RoomMember[];
}

export async function getRoomDetail(
  roomId: string,
  range?: { from: string; to: string }
): Promise<RoomDetail> {
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, invite_code, owner_id, created_at, updated_at")
    .eq("id", roomId)
    .single();

  if (roomError || !room) notFound();

  const members = await getRoomMembers(roomId);
  const activeMemberIds = members.map((member) => member.user_id);

  let eventsQuery = supabase
    .from("events")
    .select("id, room_id, creator_id, event_date, title, description, created_at, updated_at, deleted_at")
    .eq("room_id", roomId)
    .is("deleted_at", null)
    .in("creator_id", activeMemberIds.length ? activeMemberIds : ["00000000-0000-0000-0000-000000000000"])
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (range) {
    eventsQuery = eventsQuery.gte("event_date", range.from).lte("event_date", range.to);
  }

  const { data: events, error: eventsError } = await eventsQuery;
  if (eventsError) throw eventsError;

  return {
    ...(room as Room),
    members,
    events: (events || []) as CalendarEvent[]
  };
}

export async function getInvitePreview(inviteCode: string): Promise<{
  room_id: string;
  room_name: string;
  owner_name: string | null;
  owner_avatar_url: string | null;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_invite_room", {
    p_invite_code: inviteCode
  });

  if (error || !data?.[0]) return null;
  return data[0];
}

export function profileName(profile?: Profile | null) {
  return profile?.display_name || profile?.email || "이름 없음";
}
