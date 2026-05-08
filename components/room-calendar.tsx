"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, CalendarPlus, ChevronLeft, ChevronRight, Pencil, Trash2, X, Zap } from "lucide-react";

import { deleteEvent, deleteMyEventsOnDate, quickMarkEvent } from "@/app/actions";
import { DEFAULT_MEMBER_COLOR } from "@/lib/constants";
import { EventForm } from "@/components/event-form";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatKoreanDate, todayKey } from "@/lib/date";
import type { CalendarEvent, EventTemplate, Profile, RoomMember } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type CalendarCell = { key: string; day: number; inMonth: boolean; dow: number };

type Props = {
  grid: CalendarCell[];
  eventsByDate: Record<string, CalendarEvent[]>;
  members: RoomMember[];
  roomId: string;
  year: number;
  monthIndex: number;
  initialSelected: string;
  editingEvent?: CalendarEvent | null;
  templates: EventTemplate[];
  myColor?: string;
  isOwner: boolean;
  profileId?: string;
  error?: string;
};

export function RoomCalendar({
  grid,
  eventsByDate,
  members,
  roomId,
  year,
  monthIndex,
  initialSelected,
  editingEvent,
  templates,
  myColor,
  isOwner,
  profileId,
  error,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialSelected);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<"events" | "form">("events");
  const [quickMode, setQuickMode] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const memberByUser = new Map(members.map((m) => [m.user_id, m]));
  const selectedEvents = eventsByDate[selected] || [];

  const editingEventId = editingEvent?.id ?? null;

  // URL date param이 변경되면 선택 날짜 동기화
  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  // 수정 이벤트 변경 시 모바일에서 폼 뷰 자동 열기/닫기
  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    if (editingEventId) {
      setSheetView("form");
      setSheetOpen(true);
    } else {
      setSheetView((prev) => (prev === "form" ? "events" : prev));
    }
  }, [editingEventId]);

  // 데스크탑 뷰포트로 리사이즈 시 시트 닫기
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setSheetOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handleDateClick(key: string) {
    if (quickMode) {
      const myEvents = (eventsByDate[key] || []).filter((e) => e.creator_id === profileId);
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("eventDate", key);
      startTransition(async () => {
        setPendingDate(key);
        setQuickError(null);

        try {
          const result = myEvents.length > 0
            ? await deleteMyEventsOnDate(form)
            : await quickMarkEvent(form);

          if (!result.ok) {
            setQuickError(result.error || "일정을 변경할 수 없습니다.");
            return;
          }

          router.refresh();
        } catch {
          setQuickError("일정을 변경할 수 없습니다.");
        } finally {
          setPendingDate(null);
        }
      });
      return;
    }
    setSelected(key);
    if (window.innerWidth < 1024) {
      setSheetView("events");
      setSheetOpen(true);
    }
  }

  // 수정 모드에서 닫을 때 edit 쿼리 파라미터 제거
  function closeSheet() {
    setSheetOpen(false);
    if (sheetView === "form" && editingEvent) {
      router.push(`/rooms/${roomId}?date=${selected}`);
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-5 px-6 py-5 lg:flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-1">
      <Card className="overflow-hidden flex flex-col lg:h-full">
        <div className="shrink-0 border-b p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <h2 className="shrink-0 text-lg font-bold sm:text-xl">
                {year}년 {monthIndex + 1}월
              </h2>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={monthHref(roomId, year, monthIndex - 1, selected)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={monthHref(roomId, year, monthIndex + 1, selected)}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Button variant="secondary" size="sm" className="shrink-0" asChild>
                <Link href={`/rooms/${roomId}?date=${todayKey()}`}>오늘</Link>
              </Button>
            </div>
            {profileId ? (
              <Button
                variant={quickMode ? "default" : "ghost"}
                size="icon"
                className="shrink-0"
                onClick={() => setQuickMode(!quickMode)}
                aria-pressed={quickMode}
                title={quickMode ? "간편 입력 끄기" : "간편 입력 켜기"}
              >
                <Zap className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          {quickError ? (
            <p className="mt-3 text-sm text-destructive">{quickError}</p>
          ) : null}
        </div>

        <div className="shrink-0 grid calendar-grid border-b">
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

        <div className="flex-1 min-h-0 grid calendar-grid grid-rows-6 overflow-hidden">
          {grid.map((cell, index) => {
            const events = eventsByDate[cell.key] || [];
            const myEvents = profileId ? events.filter((event) => event.creator_id === profileId) : [];
            const hasMyEvent = myEvents.length > 0;
            const isSelected = selected === cell.key;
            const isToday = todayKey() === cell.key;
            const isQuickPending = pendingDate === cell.key;
            const isFreeDay = quickMode && events.length === 0;
            return (
              <button
                key={`${cell.key}-${index}`}
                onClick={() => handleDateClick(cell.key)}
                disabled={quickMode && isPending}
                className={cn(
                  "flex flex-col min-h-[80px] lg:min-h-0 overflow-hidden border-r border-b p-2 text-left transition hover:bg-secondary/70",
                  index % 7 === 6 && "border-r-0",
                  !cell.inMonth && "opacity-40",
                  isSelected && !quickMode && "bg-accent",
                  quickMode && "disabled:cursor-wait disabled:opacity-70"
                )}
                style={isFreeDay ? { backgroundColor: myColor || DEFAULT_MEMBER_COLOR } : undefined}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold",
                      isToday && !isFreeDay && "bg-primary text-primary-foreground",
                      isFreeDay && "text-white"
                    )}
                  >
                    {cell.day}
                  </span>
                  {isQuickPending ? (
                    <span className={cn("text-[10px]", isFreeDay ? "text-white" : "text-muted-foreground")}>
                      저장 중
                    </span>
                  ) : null}
                </div>
                {!quickMode && (
                  <div>
                    <div className="hidden lg:block space-y-1">
                      {events.slice(0, 3).map((event) => {
                        const member = memberByUser.get(event.creator_id);
                        return (
                          <div
                            key={event.id}
                            className="truncate rounded-md px-2 py-1 text-xs font-medium text-white"
                            style={{ backgroundColor: member?.color || "#7A8FA6" }}
                          >
                            {formatEventTime(event)}
                            {formatEventTime(event) ? " " : ""}
                            {event.title}
                          </div>
                        );
                      })}
                      {events.length > 3 ? (
                        <div className="px-2 text-xs text-muted-foreground">+{events.length - 3}개</div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1 lg:hidden">
                      {events.slice(0, 3).map((event) => {
                        const member = memberByUser.get(event.creator_id);
                        return (
                          <span
                            key={event.id}
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: member?.color || "#7A8FA6" }}
                          />
                        );
                      })}
                      {events.length > 3 ? (
                        <span className="text-[10px] text-muted-foreground leading-none self-center">
                          +{events.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:block space-y-5 lg:overflow-y-auto">
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
                  canManage={isOwner || event.creator_id === profileId}
                  roomId={roomId}
                  selected={selected}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <EventForm
            key={`${selected}-${editingEvent?.id ?? "new"}`}
            roomId={roomId}
            selected={selected}
            editingEvent={editingEvent}
            templates={templates}
            myColor={myColor}
            error={error}
          />
        </Card>
      </aside>

      {/* 모바일 바텀 시트 */}
      <BottomSheet open={sheetOpen} onClose={closeSheet}>
        {sheetView === "events" ? (
          <>
            <div className="shrink-0 flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">선택한 날짜</p>
                <h2 className="mt-0.5 text-lg font-bold">{formatKoreanDate(selected)}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{selectedEvents.length}개</Badge>
                <button
                  onClick={closeSheet}
                  className="rounded-full p-1.5 hover:bg-secondary"
                  aria-label="닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
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
                    canManage={isOwner || event.creator_id === profileId}
                    roomId={roomId}
                    selected={selected}
                  />
                ))
              )}
            </div>

            <div className="shrink-0 border-t px-5 py-4">
              <Button className="w-full" onClick={() => setSheetView("form")}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                일정 추가
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 flex items-center gap-3 border-b px-5 py-4">
              {!editingEvent && (
                <button
                  onClick={() => setSheetView("events")}
                  className="rounded-full p-1.5 hover:bg-secondary"
                  aria-label="뒤로"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="flex-1 font-bold">{editingEvent ? "일정 수정" : "일정 추가"}</span>
              <button
                onClick={closeSheet}
                className="rounded-full p-1.5 hover:bg-secondary"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <EventForm
                key={`${selected}-${editingEvent?.id ?? "new"}-mobile`}
                roomId={roomId}
                selected={selected}
                editingEvent={editingEvent}
                templates={templates}
                myColor={myColor}
                error={error}
              />
            </div>
          </>
        )}
      </BottomSheet>
    </main>
  );
}

function EventItem({
  event,
  member,
  canManage,
  roomId,
  selected,
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
                {[formatEventTimeRange(event), profileName(member?.profiles)].filter(Boolean).join(" · ")}
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

function profileName(profile?: Profile | null) {
  return profile?.display_name || profile?.email || "이름 없음";
}

function monthHref(roomId: string, year: number, monthIndex: number, selected: string) {
  const date = new Date(year, monthIndex, 1);
  return `/rooms/${roomId}?y=${date.getFullYear()}&m=${date.getMonth()}&date=${selected}`;
}

function normalizeTime(time?: string | null) {
  return time ? time.slice(0, 5) : "";
}

function formatEventTime(event: CalendarEvent) {
  return normalizeTime(event.start_time);
}

function formatEventTimeRange(event: CalendarEvent) {
  const start = normalizeTime(event.start_time);
  const end = normalizeTime(event.end_time);
  if (start && end) return `${start}-${end}`;
  if (start) return start;
  if (end) return `-${end}`;
  return "";
}
