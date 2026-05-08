import Link from "next/link";
import { ArrowLeft, Settings, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { CopyInviteButton } from "@/components/copy-invite-button";
import { RoomCalendar } from "@/components/room-calendar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildMonthGrid, todayKey } from "@/lib/date";
import { getMyProfile, getMyTemplates, getRoomDetail, profileName } from "@/lib/data";
import type { CalendarEvent } from "@/lib/types/database";

type RoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    y?: string;
    m?: string;
    date?: string;
    edit?: string;
    error?: string;
  }>;
};

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const [{ roomId }, query, profile] = await Promise.all([params, searchParams, getMyProfile()]);
  const now = new Date(todayKey());
  const year = Number(query.y || now.getFullYear());
  const monthIndex = Number(query.m || now.getMonth());
  const grid = buildMonthGrid(year, monthIndex);
  const selected = query.date || todayKey();
  const [room, templates] = await Promise.all([
    getRoomDetail(roomId, { from: grid[0].key, to: grid[grid.length - 1].key }),
    getMyTemplates()
  ]);

  const eventsByDate = room.events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    acc[event.event_date] ||= [];
    acc[event.event_date].push(event);
    return acc;
  }, {});
  Object.values(eventsByDate).forEach((events) => {
    events.sort((a, b) => eventSortValue(a).localeCompare(eventSortValue(b)));
  });

  const me = room.members.find((member) => member.user_id === profile?.id);
  const isOwner = room.owner_id === profile?.id;
  const editingEvent = query.edit
    ? room.events.find((event) => event.id === query.edit)
    : null;

  return (
    <AppShell profile={profile}>
      <div className="flex flex-col lg:h-[calc(100vh-60px)]">
      <div className="shrink-0 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/rooms" title="내 방으로">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold">{room.name}</h1>
                {isOwner ? <Badge className="bg-accent text-accent-foreground">방장</Badge> : null}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> 멤버 {room.members.length}명
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="avatar-stack hidden sm:inline-flex">
              {room.members.map((member) => (
                <Avatar
                  key={member.user_id}
                  name={profileName(member.profiles)}
                  email={member.profiles?.email}
                  src={member.profiles?.avatar_url}
                  color={member.color}
                  size="sm"
                />
              ))}
            </div>
            <CopyInviteButton inviteCode={room.invite_code} />
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/rooms/${room.id}/members`}>
                <Settings className="h-3.5 w-3.5" /> 방 정보
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <RoomCalendar
        grid={grid}
        eventsByDate={eventsByDate}
        members={room.members}
        roomId={room.id}
        year={year}
        monthIndex={monthIndex}
        initialSelected={selected}
        editingEvent={editingEvent}
        templates={templates}
        myColor={me?.color}
        isOwner={isOwner}
        profileId={profile?.id}
        error={query.error}
      />
      </div>
    </AppShell>
  );
}

function eventSortValue(event: CalendarEvent) {
  return `${event.start_time || "99:99"}-${event.created_at}`;
}
