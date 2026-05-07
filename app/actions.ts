"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DEFAULT_MEMBER_COLOR } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireSupabase() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase 환경 변수를 먼저 설정해주세요.");
  }
  return supabase;
}

export async function signInWithGoogle(formData: FormData) {
  const next = readString(formData, "next") || "/rooms";
  const supabase = await requireSupabase();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(next)}`)
    }
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await requireSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createRoom(formData: FormData) {
  const name = readString(formData, "name");
  const password = readString(formData, "password");
  const color = readString(formData, "color") || DEFAULT_MEMBER_COLOR;
  const supabase = await requireSupabase();

  const { data, error } = await supabase.rpc("create_room", {
    p_name: name,
    p_password: password,
    p_color: color
  });

  if (error || !data?.[0]) {
    redirect(`/rooms/new?error=${encodeURIComponent(error?.message || "방을 만들 수 없습니다.")}`);
  }

  revalidatePath("/rooms");
  redirect(`/rooms/${data[0].room_id}`);
}

export async function joinRoom(formData: FormData) {
  const inviteCode = readString(formData, "inviteCode");
  const password = readString(formData, "password");
  const color = readString(formData, "color") || DEFAULT_MEMBER_COLOR;
  const supabase = await requireSupabase();

  const { data, error } = await supabase.rpc("join_room", {
    p_invite_code: inviteCode,
    p_password: password,
    p_color: color
  });

  if (error || !data?.[0]) {
    redirect(`/invite/${inviteCode}?error=${encodeURIComponent(error?.message || "방에 입장할 수 없습니다.")}`);
  }

  revalidatePath("/rooms");
  redirect(`/rooms/${data[0].room_id}`);
}

export async function createEvent(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const eventDate = readString(formData, "eventDate");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const supabase = await requireSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("events").insert({
    room_id: roomId,
    creator_id: user.id,
    event_date: eventDate,
    title,
    description
  });

  if (error) redirect(`/rooms/${roomId}?date=${eventDate}&error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?date=${eventDate}`);
}

export async function updateEvent(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const eventId = readString(formData, "eventId");
  const eventDate = readString(formData, "eventDate");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const supabase = await requireSupabase();

  const { error } = await supabase
    .from("events")
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("room_id", roomId);

  if (error) redirect(`/rooms/${roomId}?date=${eventDate}&error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?date=${eventDate}`);
}

export async function deleteEvent(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const eventId = readString(formData, "eventId");
  const eventDate = readString(formData, "eventDate");
  const supabase = await requireSupabase();

  const { error } = await supabase.rpc("delete_event", {
    p_room_id: roomId,
    p_event_id: eventId
  });

  if (error) redirect(`/rooms/${roomId}?date=${eventDate}&error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/rooms/${roomId}`);
  redirect(`/rooms/${roomId}?date=${eventDate}`);
}

export async function updateMyRoomColor(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const color = readString(formData, "color");
  const supabase = await requireSupabase();

  const { error } = await supabase.rpc("update_my_room_color", {
    p_room_id: roomId,
    p_color: color
  });

  if (error) redirect(`/rooms/${roomId}/members?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath(`/rooms/${roomId}/members`);
  redirect(`/rooms/${roomId}/members`);
}

export async function changeRoomPassword(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const currentPassword = readString(formData, "currentPassword");
  const newPassword = readString(formData, "newPassword");
  const supabase = await requireSupabase();

  const { error } = await supabase.rpc("change_room_password", {
    p_room_id: roomId,
    p_current_password: currentPassword,
    p_new_password: newPassword
  });

  if (error) redirect(`/rooms/${roomId}/members?error=${encodeURIComponent(error.message)}`);

  redirect(`/rooms/${roomId}/members?success=password`);
}

export async function leaveRoom(formData: FormData) {
  const roomId = readString(formData, "roomId");
  const supabase = await requireSupabase();

  const { error } = await supabase.rpc("leave_room", {
    p_room_id: roomId
  });

  if (error) redirect(`/rooms/${roomId}/members?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/rooms");
  redirect("/rooms");
}
