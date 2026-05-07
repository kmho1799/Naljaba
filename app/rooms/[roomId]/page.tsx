import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  LinkIcon,
  Pencil,
  Settings,
  Trash2,
  Users
} from "lucide-react";

import { createEvent, deleteEvent, updateEvent } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildMonthGrid, formatKoreanDate, todayKey } from "@/lib/date";
import { getMyProfile, getRoomDetail, profileName } from "@/lib/data";
import type { CalendarEvent, RoomMember } from "@/lib/types/database";
import { cn } from "@/lib/utils";

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
  const room = await getRoomDetail(roomId, {
    from: grid[0].key,
    to: grid[grid.length - 1].key
  });

  const memberByUser = new Map(room.members.map((member) => [member.user_id, member]));
  const eventsByDate = room.events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    acc[event.event_date] ||= [];
    acc[event.event_date].push(event);
    return acc;
  }, {});
  const selectedEvents = eventsByDate[selected] || [];
  const me = room.members.find((member) => member.user_id === profile?.id);
  const isOwner = room.owner_id === profile?.id;
  const editingEvent = query.edit
    ? room.events.find((event) => event.id === query.edit)
    : null;

  return (
    <AppShell profile={profile}>
      <div className="border-b bg-white">
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
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/invite/${room.invite_code}`}>
                <LinkIcon className="h-3.5 w-3.5" /> 초대
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/rooms/${room.id}/members`}>
                <Settings className="h-3.5 w-3.5" /> 방 관리
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {year}년 {monthIndex + 1}월
              </h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={monthHref(room.id, year, monthIndex - 1, selected)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={monthHref(room.id, year, monthIndex + 1, selected)}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/rooms/${room.id}?date=${todayKey()}`}>오늘</Link>
              </Button>
            </div>
          </div>

          <div className="grid calendar-grid border-b">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
              <div
                key={day}
                className={cn(
                  "px-3 py-2 text-left text-xs font-semibold",
                  index === 0 && "text-red-500",
                  index === 6 && "text-blue-500",
                  index !== 0 && index !== 6 && "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid calendar-grid">
            {grid.map((cell, index) => {
              const events = eventsByDate[cell.key] || [];
              const isSelected = selected === cell.key;
              const isToday = todayKey() === cell.key;
              return (
                <Link
                  key={`${cell.key}-${index}`}
                  href={`/rooms/${room.id}?y=${year}&m=${monthIndex}&date=${cell.key}`}
                  className={cn(
                    "min-h-[118px] border-r border-b p-2 text-left transition hover:bg-secondary/70",
                    index % 7 === 6 && "border-r-0",
                    !cell.inMonth && "opacity-40",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold",
                        isToday && "bg-primary text-primary-foreground"
                      )}
                    >
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => {
                      const member = memberByUser.get(event.creator_id);
                      return (
                        <div
                          key={event.id}
                          className="truncate rounded-md px-2 py-1 text-xs font-medium text-white"
                          style={{ backgroundColor: member?.color || "#7A8FA6" }}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                    {events.length > 3 ? (
                      <div className="px-2 text-xs text-muted-foreground">+{events.length - 3}개</div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">선택한 날짜</p>
                <h2 className="mt-1 text-lg font-bold">{formatKoreanDate(selected)}</h2>
              </div>
              <Badge>{selectedEvents.length}개</Badge>
            </div>

            <div className="space-y-3">
              {selectedEvents.length === 0 ? (
                <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                  이 날짜에는 아직 일정이 없어요.
                </p>
              ) : (
                selectedEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    member={memberByUser.get(event.creator_id)}
                    canManage={isOwner || event.creator_id === profile?.id}
                    roomId={room.id}
                    selected={selected}
                  />
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarPlus className="h-4 w-4 text-primary" />
              <h2 className="font-bold">{editingEvent ? "일정 수정" : "일정 추가"}</h2>
            </div>
            <form action={editingEvent ? updateEvent : createEvent} className="space-y-4">
              <input type="hidden" name="roomId" value={room.id} />
              <input type="hidden" name="eventDate" value={selected} />
              {editingEvent ? <input type="hidden" name="eventId" value={editingEvent.id} /> : null}
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" defaultValue={editingEvent?.title || ""} placeholder="예: 스터디 가능" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" name="description" defaultValue={editingEvent?.description || ""} placeholder="필요한 메모를 적어주세요" />
              </div>
              {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
              <div className="flex gap-2">
                <Button className="flex-1">{editingEvent ? "수정하기" : "추가하기"}</Button>
                {editingEvent ? (
                  <Button variant="secondary" asChild>
                    <Link href={`/rooms/${room.id}?date=${selected}`}>취소</Link>
                  </Button>
                ) : null}
              </div>
            </form>
            {me ? (
              <p className="mt-4 text-xs text-muted-foreground">
                내 일정은 <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: me.color }} /> 색상으로 표시됩니다.
              </p>
            ) : null}
          </Card>
        </aside>
      </main>
    </AppShell>
  );
}

function EventItem({
  event,
  member,
  canManage,
  roomId,
  selected
}: {
  event: CalendarEvent;
  member?: RoomMember;
  canManage: boolean;
  roomId: string;
  selected: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: member?.color || "#7A8FA6" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {profileName(member?.profiles)}
              </p>
            </div>
            {canManage ? (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/rooms/${roomId}?date=${selected}&edit=${event.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <form action={deleteEvent}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="eventDate" value={selected} />
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
          {event.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{event.description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function monthHref(roomId: string, year: number, monthIndex: number, selected: string) {
  const date = new Date(year, monthIndex, 1);
  return `/rooms/${roomId}?y=${date.getFullYear()}&m=${date.getMonth()}&date=${selected}`;
}
