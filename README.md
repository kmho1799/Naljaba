# 날잡아

날잡아는 초대 링크로 모인 사람들이 각자의 일정을 색상별로 입력하고, 함께 가능한 날짜를 빠르게 찾는 공동 캘린더 서비스입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 스타일 로컬 컴포넌트
- Supabase Auth, Database, RLS, RPC
- Google OAuth

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에는 Supabase 프로젝트 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase 설정

1. Supabase 프로젝트를 생성합니다.
2. `supabase/migrations/001_initial_schema.sql`을 SQL Editor에서 실행합니다.
3. Authentication > Providers에서 Google OAuth를 활성화합니다.
4. Google OAuth 리디렉션 URL에 다음 주소를 추가합니다.

```text
http://localhost:3000/auth/callback
```

배포 환경에서는 배포 도메인의 `/auth/callback`도 추가해야 합니다.

## 주요 경로

- `/login`: Google 로그인
- `/rooms`: 참여 중인 방 목록
- `/rooms/new`: 방 생성
- `/invite/[inviteCode]`: 초대 링크 입장
- `/rooms/[roomId]`: 공동 캘린더
- `/rooms/[roomId]/members`: 멤버 및 방 관리

## MVP 정책

- 로그인한 사용자만 서비스 이용 가능
- 방 이름은 중복 가능
- 초대 링크와 방 비밀번호로 입장
- 방 비밀번호는 해시로 저장
- 방장과 작성자만 일정 수정/삭제 가능
- 일반 멤버는 퇴장 가능
- 방장은 방 삭제/방장 위임이 없으므로 퇴장 불가
- 퇴장한 사용자의 일정은 숨김
- 재입장 시 기존 멤버십과 일정 복구
- 시간대는 `Asia/Seoul` 기준

## 검증 명령

```bash
npm run typecheck
npm run lint
npm run build
```
