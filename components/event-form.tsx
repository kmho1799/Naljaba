"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";

import { bulkCreateEvents, createTemplate, deleteTemplate, updateEvent, updateTemplate } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeSelect } from "@/components/ui/time-select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildMonthGrid, formatShortDate } from "@/lib/date";
import type { CalendarEvent, EventTemplate } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type Props = {
  roomId: string;
  selected: string;
  editingEvent?: CalendarEvent | null;
  templates: EventTemplate[];
  myColor?: string;
  error?: string;
};

export function EventForm({ roomId, selected, editingEvent, templates, myColor, error }: Props) {
  const isEditing = !!editingEvent;

  const [dates, setDates] = useState<string[]>([selected]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(() => Number(selected.slice(0, 4)));
  const [calMonth, setCalMonth] = useState(() => Number(selected.slice(5, 7)) - 1);

  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [description, setDescription] = useState(editingEvent?.description ?? "");
  const [startTime, setStartTime] = useState(normalizeTime(editingEvent?.start_time));
  const [endTime, setEndTime] = useState(normalizeTime(editingEvent?.end_time));

  function toggleDate(key: string) {
    setDates((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((d) => d !== key) : prev
        : [...prev, key].sort()
    );
  }

  function removeDate(key: string) {
    setDates((prev) => (prev.length > 1 ? prev.filter((d) => d !== key) : prev));
  }

  function applyTemplate(t: EventTemplate) {
    setTitle(t.title);
    setDescription(t.description ?? "");
    setStartTime(normalizeTime(t.start_time));
    setEndTime(normalizeTime(t.end_time));
    setShowTemplatePanel(false);
  }

  function goPrevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }

  function goNextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  const grid = buildMonthGrid(calYear, calMonth);
  const submitLabel = isEditing ? "수정하기" : dates.length > 1 ? `${dates.length}개 날짜에 추가하기` : "추가하기";

  return (
    <div className="p-5">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-primary" />
          <h2 className="font-bold">{isEditing ? "일정 수정" : "일정 추가"}</h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => { setShowTemplatePanel((v) => !v); setEditingTemplateId(null); setShowAddForm(false); }}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            자주 쓰는 일정 {showTemplatePanel ? "▲" : "▼"}
          </button>
        )}
      </div>

      {/* 자주 쓰는 일정 패널 — 메인 폼 밖 */}
      {!isEditing && showTemplatePanel && (
        <div className="mb-4 space-y-2 rounded-lg border bg-secondary/30 p-3">
          {templates.length === 0 && !showAddForm && (
            <p className="text-sm text-muted-foreground">저장된 일정이 없어요.</p>
          )}

          {templates.map((t) =>
            editingTemplateId === t.id ? (
              <form key={t.id} action={updateTemplate} className="space-y-2 rounded-lg border bg-white p-3">
                <input type="hidden" name="roomId" value={roomId} />
                <input type="hidden" name="templateId" value={t.id} />
                <input type="hidden" name="selectedDate" value={selected} />
                <Input name="title" defaultValue={t.title} required placeholder="제목" />
                <div className="grid grid-cols-2 gap-2">
                  <TimeSelect name="startTime" defaultValue={normalizeTime(t.start_time)} />
                  <TimeSelect name="endTime" defaultValue={normalizeTime(t.end_time)} />
                </div>
                <Input name="description" defaultValue={t.description ?? ""} placeholder="설명 (선택)" />
                <div className="flex gap-2">
                  <Button size="sm">저장</Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditingTemplateId(null)}>취소</Button>
                </div>
              </form>
            ) : (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block text-sm font-medium">{t.title}</span>
                  {(t.start_time || t.end_time) && (
                    <span className="text-xs text-muted-foreground">
                      {[normalizeTime(t.start_time), normalizeTime(t.end_time)].filter(Boolean).join("~")}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingTemplateId(t.id); setShowAddForm(false); }}
                  className="shrink-0 rounded p-1 hover:bg-secondary"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <form action={deleteTemplate}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="templateId" value={t.id} />
                  <input type="hidden" name="selectedDate" value={selected} />
                  <button type="submit" className="shrink-0 rounded p-1 hover:bg-secondary">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </form>
              </div>
            )
          )}

          {showAddForm ? (
            <form action={createTemplate} className="space-y-2 rounded-lg border bg-white p-3">
              <input type="hidden" name="roomId" value={roomId} />
              <input type="hidden" name="selectedDate" value={selected} />
              <Input name="title" required placeholder="제목 *" />
              <div className="grid grid-cols-2 gap-2">
                <TimeSelect name="startTime" />
                <TimeSelect name="endTime" />
              </div>
              <Input name="description" placeholder="설명 (선택)" />
              <div className="flex gap-2">
                <Button size="sm">저장</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>취소</Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setEditingTemplateId(null); }}
              className="w-full rounded-lg border border-dashed py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              + 새 일정 추가
            </button>
          )}
        </div>
      )}

      {/* 메인 이벤트 폼 */}
      <form action={isEditing ? updateEvent : bulkCreateEvents} className="space-y-4">
        <input type="hidden" name="roomId" value={roomId} />
        {isEditing ? (
          <>
            <input type="hidden" name="eventId" value={editingEvent.id} />
            <input type="hidden" name="eventDate" value={selected} />
          </>
        ) : (
          <input type="hidden" name="eventDates" value={dates.join(",")} />
        )}

        {/* 날짜 태그 (생성 모드) */}
        {!isEditing && (
          <div className="space-y-2">
            <Label>날짜</Label>
            <div className="relative flex flex-wrap items-center gap-1.5">
              {dates.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium"
                >
                  {formatShortDate(d)}
                  <button
                    type="button"
                    onClick={() => removeDate(d)}
                    className="rounded-full hover:text-destructive"
                    aria-label="날짜 제거"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setShowCalendar((v) => !v)}
                className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                추가 +
              </button>

              {showCalendar && (
                <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border bg-white p-3 shadow-md">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={goPrevMonth} className="rounded p-1 hover:bg-secondary">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-semibold">
                      {calYear}년 {calMonth + 1}월
                    </span>
                    <button type="button" onClick={goNextMonth} className="rounded p-1 hover:bg-secondary">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                      <div key={d} className="py-0.5 text-center text-[10px] text-muted-foreground">
                        {d}
                      </div>
                    ))}
                    {grid.map((cell, i) => (
                      <button
                        key={`${cell.key}-${i}`}
                        type="button"
                        onClick={() => toggleDate(cell.key)}
                        className={cn(
                          "rounded py-0.5 text-center text-xs",
                          !cell.inMonth && "opacity-30",
                          dates.includes(cell.key)
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "hover:bg-secondary"
                        )}
                      >
                        {cell.day}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="text-xs text-primary hover:underline"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 스터디 가능"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>시작 시간</Label>
            <TimeSelect name="startTime" value={startTime} onChange={setStartTime} />
          </div>
          <div className="space-y-2">
            <Label>종료 시간</Label>
            <TimeSelect name="endTime" value={endTime} onChange={setEndTime} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="필요한 메모를 적어주세요"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex gap-2">
          <Button className="flex-1">{submitLabel}</Button>
          {isEditing && (
            <Button variant="secondary" asChild>
              <Link href={`/rooms/${roomId}?date=${selected}`}>취소</Link>
            </Button>
          )}
        </div>
      </form>

      {myColor ? (
        <p className="mt-4 text-xs text-muted-foreground">
          내 일정은{" "}
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: myColor }}
          />{" "}
          색상으로 표시됩니다.
        </p>
      ) : null}
    </div>
  );
}

function normalizeTime(time?: string | null) {
  return time ? time.slice(0, 5) : "";
}
