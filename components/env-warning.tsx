import { Card } from "@/components/ui/card";

export function EnvWarning() {
  return (
    <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Supabase 환경 변수가 아직 설정되지 않았습니다. `.env.local`에
      `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 채운 뒤 실행해주세요.
    </Card>
  );
}
