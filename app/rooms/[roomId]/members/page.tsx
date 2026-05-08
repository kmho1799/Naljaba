import Link from "next/link";
import { ArrowLeft, KeyRound, LogOut, Palette, ShieldAlert } from "lucide-react";

import { changeRoomPassword, leaveRoom, updateMyRoomColor } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ColorPicker } from "@/components/color-picker";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile, getRoomDetail, profileName } from "@/lib/data";

type MembersPageProps = {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function MembersPage({ params, searchParams }: MembersPageProps) {
  const [{ roomId }, query, profile] = await Promise.all([params, searchParams, getMyProfile()]);
  const room = await getRoomDetail(roomId);
  const isOwner = room.owner_id === profile?.id;
  const myMember = room.members.find((member) => member.user_id === profile?.id);

  return (
    <AppShell profile={profile}>
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/rooms/${room.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{room.name}</p>
            <h1 className="text-lg font-bold">방 정보</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl gap-5 px-6 py-8 md:grid-cols-2">
        <Card className="p-6 md:col-span-2">
          <div className="mb-5">
            <h2 className="font-bold">멤버 ({room.members.length})</h2>
            <p className="mt-1 text-sm text-muted-foreground">이 방에 참여 중인 활성 멤버예요.</p>
          </div>
          <div className="space-y-2">
            {room.members.map((member) => {
              const isMe = member.user_id === profile?.id;
              return (
                <div
                  key={member.user_id}
                  className={isMe ? "flex items-center gap-3 rounded-xl bg-accent p-3" : "flex items-center gap-3 rounded-xl p-3"}
                >
                  <Avatar
                    name={profileName(member.profiles)}
                    email={member.profiles?.email}
                    src={member.profiles?.avatar_url}
                    color={member.color}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{profileName(member.profiles)}</span>
                      {isMe ? <Badge className="bg-white text-accent-foreground">나</Badge> : null}
                      {member.role === "owner" ? <Badge className="bg-orange-50 text-orange-700">방장</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{member.profiles?.email}</p>
                  </div>
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: member.color }}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
              <Palette className="h-4 w-4" />
            </span>
            <h2 className="font-bold">내 색상</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            방 안에서 내 일정에 표시될 색상이에요. 방장도 언제든 변경할 수 있어요.
          </p>
          <form action={updateMyRoomColor} className="space-y-4">
            <input type="hidden" name="roomId" value={room.id} />
            <ColorPicker value={myMember?.color} compact />
            <Button variant="secondary" size="sm">색상 저장</Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
              <KeyRound className="h-4 w-4" />
            </span>
            <h2 className="font-bold">방 비밀번호</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {isOwner
              ? "방장만 변경할 수 있어요. 기존 활성 멤버에게는 영향을 주지 않습니다."
              : "방장만 변경할 수 있어요."}
          </p>
          {isOwner ? (
            <form action={changeRoomPassword} className="space-y-3">
              <input type="hidden" name="roomId" value={room.id} />
              <div className="space-y-2">
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input id="currentPassword" name="currentPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input id="newPassword" name="newPassword" type="password" minLength={4} required />
              </div>
              <Button variant="secondary" size="sm">비밀번호 변경</Button>
            </form>
          ) : (
            <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
              변경 권한이 없습니다.
            </div>
          )}
        </Card>

        <Card className={isOwner ? "p-6 md:col-span-2" : "border-red-100 bg-red-50/30 p-6 md:col-span-2"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {isOwner ? <ShieldAlert className="h-4 w-4 text-muted-foreground" /> : <LogOut className="h-4 w-4 text-destructive" />}
                <h2 className={isOwner ? "font-bold text-muted-foreground" : "font-bold text-destructive"}>
                  {isOwner ? "방장은 퇴장할 수 없어요" : "방 나가기"}
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isOwner
                  ? "현재 버전에서는 방 삭제와 방장 위임을 제공하지 않으므로 방장은 퇴장할 수 없습니다."
                  : "방을 나가면 내가 작성한 일정은 숨겨지고, 같은 초대 링크와 현재 비밀번호로 재입장하면 복구됩니다."}
              </p>
            </div>
            <form action={leaveRoom}>
              <input type="hidden" name="roomId" value={room.id} />
              <Button variant="destructive" disabled={isOwner}>
                <LogOut className="h-4 w-4" /> 방 나가기
              </Button>
            </form>
          </div>
        </Card>

        {query.error ? <p className="md:col-span-2 text-sm text-destructive">{query.error}</p> : null}
        {query.success ? <p className="md:col-span-2 text-sm text-primary">변경사항을 저장했습니다.</p> : null}
      </main>
    </AppShell>
  );
}
