import { ArrowRight, LinkIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { joinRoom } from "@/app/actions";
import { ColorPicker } from "@/components/color-picker";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvitePreview } from "@/lib/data";

type InvitePageProps = {
  params: Promise<{
    inviteCode: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const [{ inviteCode }, query] = await Promise.all([params, searchParams]);
  const preview = await getInvitePreview(inviteCode);
  if (!preview) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-[480px] p-8">
        <div className="mb-5">
          <Logo href="" size={52} />
        </div>
        <Badge className="mb-4 bg-accent text-accent-foreground">
          <LinkIcon className="h-3 w-3" /> 초대 링크
        </Badge>
        <h1 className="text-2xl font-bold">{preview.room_name}</h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar
            name={preview.owner_name}
            src={preview.owner_avatar_url}
            size="sm"
          />
          방장 <strong className="text-foreground">{preview.owner_name || "알 수 없음"}</strong>님이 초대했어요.
        </div>
        <form action={joinRoom} className="mt-7 space-y-6">
          <input type="hidden" name="inviteCode" value={inviteCode} />
          <div className="space-y-2">
            <Label htmlFor="password">방 비밀번호</Label>
            <Input id="password" name="password" type="password" placeholder="비밀번호" required autoFocus />
            {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
          </div>
          <div className="space-y-3">
            <Label>내 색상</Label>
            <ColorPicker compact />
          </div>
          <Button size="lg" className="w-full">
            방 입장 <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </main>
  );
}
