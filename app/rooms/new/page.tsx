import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { createRoom } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ColorPicker } from "@/components/color-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMyProfile } from "@/lib/data";

type NewRoomPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewRoomPage({ searchParams }: NewRoomPageProps) {
  const [profile, params] = await Promise.all([getMyProfile(), searchParams]);

  return (
    <AppShell profile={profile}>
      <main className="mx-auto max-w-xl px-6 py-10">
        <Button variant="ghost" size="sm" className="-ml-3 mb-5" asChild>
          <Link href="/rooms" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> 내 방으로
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">새 방 만들기</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          방 이름과 비밀번호만 있으면 시작할 수 있어요.
        </p>

        <Card className="mt-8 p-7">
          <form action={createRoom} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">방 이름</Label>
              <Input id="name" name="name" placeholder="예: 디자인 스터디" maxLength={30} required />
              <p className="text-xs text-muted-foreground">
                방 이름이 중복되어도 괜찮아요. 초대 링크는 자동으로 만들어져요.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">방 비밀번호</Label>
              <Input id="password" name="password" type="password" placeholder="4자 이상" minLength={4} maxLength={40} required />
              <p className="text-xs text-muted-foreground">
                초대 링크와 함께 공유할 간단한 비밀번호입니다.
              </p>
            </div>
            <div className="space-y-3">
              <Label>내 색상</Label>
              <ColorPicker />
            </div>
            {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}
            <Button size="lg" className="w-full">
              방 만들기 <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </main>
    </AppShell>
  );
}
