import Link from "next/link";
import { CalendarDays, Plus, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMyProfile, getRooms, profileName } from "@/lib/data";

export default async function RoomsPage() {
  const [profile, rooms] = await Promise.all([getMyProfile(), getRooms()]);

  return (
    <AppShell profile={profile}>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">내 방</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              참여 중인 캘린더 방 {rooms.length}개
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/rooms/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> 새 방 만들기
            </Link>
          </Button>
        </div>

        {rooms.length === 0 ? (
          <Card className="flex min-h-72 flex-col items-center justify-center p-10 text-center">
            <CalendarDays className="mb-4 h-10 w-10 text-primary" />
            <h2 className="text-lg font-bold">아직 참여 중인 방이 없어요</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              새 방을 만들거나 초대 링크로 방에 입장해보세요.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/rooms/new">첫 방 만들기</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} className="group h-full">
                <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-soft">
                  <div className="h-1.5" style={{ backgroundColor: room.my_color }} />
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-lg font-bold">{room.name}</h2>
                      {room.my_role === "owner" ? (
                        <Badge className="bg-accent text-accent-foreground">방장</Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="avatar-stack">
                        {room.members.slice(0, 4).map((member) => (
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
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {room.members.length}명 · 오늘 일정 {room.today_event_count}개
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            <Link href="/rooms/new" className="h-full">
              <Card className="flex h-full min-h-[120px] flex-col items-center justify-center gap-3 border-dashed bg-transparent text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-primary">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Plus className="h-5 w-5" />
                </span>
                새 방 만들기
              </Card>
            </Link>
          </div>
        )}
      </main>
    </AppShell>
  );
}
