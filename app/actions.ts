"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DEFAULT_MEMBER_COLOR } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { safeInternalRedirectPath } from "@/lib/auth/redirect";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function roomCalendarUrl(roomId: string, date: string, formData: FormData, error?: string) {
  const params = new URLSearchParams();
  const calendarYear = readString(formData, "calendarYear");
  const calendarMonth = readString(formData, "calendarMonth");

  if (calendarYear) params.set("y", calendarYear);
  if (calendarMonth) params.set("m", calendarMonth);
  if (date) params.set("date", date);
  if (error) params.set("error", error);

  const query = params.toString();
  return query ? `/rooms/${roomId}?${query}` : `/rooms/${roomId}`;
}

type ActionResult = {
  ok: boolean;
  error?: string;
};

async function requireSupabase() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase 환경 변수를 먼저 설정해주세요.");
  }
  return supabase;
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeInternalRedirectPath(readString(formData, "next"));
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
  const startTime = readOptionalString(formData, "startTime");
  const endTime = readOptionalString(formData, "endTime");
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
    start_time: startTime,
    end_time: endTime,
    title,
    description
  });

  if (error) redirect(roomCalendarUrl(roomId, eventDate, formData, error.message));

  revalidatePath(`/rooms/${roomId}`);
  redirect(roomCalendarUrl(roomId, eventDate, formData));
}

export async function quickMarkEvent(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const eventDate = readString(formData, "eventDate");
  const supabase = await requireSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { error } = await supabase.from("events").insert({
    room_id: roomId,
    creator_id: user.id,
    event_date: eventDate,
    title: "일정",
    start_time: null,
    end_time: null,
    description: null
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const eventId = readString(formData, "eventId");
  const startTime = readOptionalString(formData, "startTime");
  const endTime = readOptionalString(formData, "endTime");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const supabase = await requireSupabase();

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      updated_at: new Date().toISOString()
    })
    .eq("id", eventId)
    .eq("room_id", roomId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function deleteEvent(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const eventId = readString(formData, "eventId");
  const supabase = await requireSupabase();

  const { error } = await supabase.rpc("delete_event", {
    p_room_id: roomId,
    p_event_id: eventId
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function deleteMyEventsOnDate(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const eventDate = readString(formData, "eventDate");
  const supabase = await requireSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: events, error: findError } = await supabase
    .from("events")
    .select("id")
    .eq("room_id", roomId)
    .eq("event_date", eventDate)
    .eq("creator_id", user.id)
    .is("deleted_at", null);

  if (findError) return { ok: false, error: findError.message };

  for (const event of events || []) {
    const { error } = await supabase.rpc("delete_event", {
      p_room_id: roomId,
      p_event_id: event.id
    });

    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
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

export async function bulkCreateEvents(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const eventDates = readString(formData, "eventDates").split(",").map((d) => d.trim()).filter(Boolean);
  const startTime = readOptionalString(formData, "startTime");
  const endTime = readOptionalString(formData, "endTime");
  const title = readString(formData, "title");
  const description = readString(formData, "description");
  const supabase = await requireSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const rows = eventDates.map((event_date) => ({
    room_id: roomId,
    creator_id: user.id,
    event_date,
    start_time: startTime,
    end_time: endTime,
    title,
    description
  }));

  const { error } = await supabase.from("events").insert(rows);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function createTemplate(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const title = readString(formData, "title");
  const description = readOptionalString(formData, "description");
  const startTime = readOptionalString(formData, "startTime");
  const endTime = readOptionalString(formData, "endTime");

  if (startTime && endTime && endTime < startTime) {
    return { ok: false, error: "종료 시간은 시작 시간보다 빠를 수 없습니다." };
  }

  const supabase = await requireSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("event_templates").insert({
    user_id: user.id,
    title,
    description,
    start_time: startTime,
    end_time: endTime
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function updateTemplate(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const templateId = readString(formData, "templateId");
  const title = readString(formData, "title");
  const description = readOptionalString(formData, "description");
  const startTime = readOptionalString(formData, "startTime");
  const endTime = readOptionalString(formData, "endTime");

  if (startTime && endTime && endTime < startTime) {
    return { ok: false, error: "종료 시간은 시작 시간보다 빠를 수 없습니다." };
  }

  const supabase = await requireSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("event_templates")
    .update({ title, description, start_time: startTime, end_time: endTime })
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}

export async function deleteTemplate(formData: FormData): Promise<ActionResult> {
  const roomId = readString(formData, "roomId");
  const templateId = readString(formData, "templateId");

  const supabase = await requireSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("event_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/rooms/${roomId}`);
  return { ok: true };
}
