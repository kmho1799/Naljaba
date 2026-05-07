import { CalendarDays, Palette, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/app/actions";
import { EnvWarning } from "@/components/env-warning";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/data";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(params.next || "/rooms");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(900px_500px_at_80%_-10%,#eef1ff,transparent_60%),radial-gradient(700px_420px_at_-10%_105%,#fff1ec,transparent_60%)] px-6 py-10">
      <div className="w-full max-w-[420px] text-center">
        <div className="mb-6 flex justify-center">
          <Logo href="" size={120} markOnly />
        </div>
        <h1 className="mb-3 text-[34px] font-bold leading-tight">
          여러 사람의 일정을
          <br />한 화면에서 맞춰보세요
        </h1>
        <p className="mb-8 text-sm leading-6 text-muted-foreground">
          방을 만들고 초대 링크를 공유하면, 멤버들이 자신의 색상으로 일정을 입력할 수 있어요.
          가능한 날짜를 한눈에 확인하세요.
        </p>
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={params.next || "/rooms"} />
          <Button
            size="lg"
            variant="secondary"
            className="h-[52px] w-full border-input bg-white text-[15px] shadow-sm"
            disabled={!hasSupabaseEnv()}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold">
              G
            </span>
            Google 계정으로 시작하기
          </Button>
        </form>
        {params.error ? <p className="mt-4 text-sm text-destructive">{params.error}</p> : null}
        <div className="mt-6">{!hasSupabaseEnv() ? <EnvWarning /> : null}</div>
        <div className="mt-16 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" /> 방 기반 협업
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-primary" /> 멤버별 색상
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" /> 공동 캘린더
          </span>
        </div>
      </div>
    </main>
  );
}
