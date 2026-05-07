export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type RoomMember = {
  room_id: string;
  user_id: string;
  role: "owner" | "member";
  color: string;
  joined_at: string;
  left_at: string | null;
  profiles?: Profile | null;
};

export type CalendarEvent = {
  id: string;
  room_id: string;
  creator_id: string;
  event_date: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RoomListItem = Room & {
  my_role: "owner" | "member";
  my_color: string;
  members: RoomMember[];
  upcoming_event_count: number;
};

export type RoomDetail = Room & {
  members: RoomMember[];
  events: CalendarEvent[];
};
