import Link from "next/link";

import { Logo } from "@/components/logo";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Logo />
        </div>

        <article className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-primary">Naljaba</p>
          <h1 className="mt-2 text-3xl font-bold">Naljaba 개인정보처리방침</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Naljaba(이하 “서비스”)는 공동 캘린더 서비스를 제공하기 위해 필요한 범위 내에서
            개인정보를 처리합니다. 본 개인정보처리방침은 서비스 이용 과정에서 어떤 개인정보가
            수집·이용·보관·삭제되는지 안내하기 위한 문서입니다.
          </p>

          <section className="mt-8 space-y-3">
            <h2 className="text-lg font-bold">1. 개인정보의 처리 목적</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 다음의 목적을 위해 개인정보를 처리합니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Google OAuth를 통한 사용자 로그인 및 본인 식별</li>
              <li>공동 캘린더 방 생성, 참여 및 멤버 관리</li>
              <li>멤버별 색상 구분 및 일정 공유 기능 제공</li>
              <li>가능한 날짜 확인 및 일정 조율 기능 제공</li>
              <li>초대 링크를 통한 방 입장 및 재입장 처리</li>
              <li>서비스 운영, 오류 확인 및 이용 문의 대응</li>
            </ul>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">2. 처리하는 개인정보 항목</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스 이용 과정에서 다음 정보가 처리될 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Google OAuth 로그인 정보: 이름, 이메일 주소, 프로필 이미지</li>
              <li>
                서비스 이용 정보: 사용자가 생성하거나 참여한 방 정보, 멤버 정보, 멤버 색상,
                일정 입력 정보, 초대 링크 입장 정보
              </li>
              <li>운영 관련 정보: 서비스 이용 중 발생하는 오류 및 문의 대응에 필요한 정보</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 공동 캘린더 기능 제공에 필요한 최소한의 정보만 처리합니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 개인정보를 서비스 제공에 필요한 기간 동안 보유 및 이용합니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>사용자가 생성하거나 참여한 방, 일정, 멤버 정보는 해당 기능 제공을 위해 보관됩니다.</li>
              <li>사용자가 방을 나간 경우 해당 사용자의 일정은 다른 사용자에게 숨김 처리될 수 있습니다.</li>
              <li>
                같은 초대 링크와 현재 비밀번호로 재입장하는 경우, 기존 멤버십 및 일정 정보가
                복구될 수 있습니다.
              </li>
              <li>
                사용자가 삭제를 요청하거나 서비스 제공 목적이 달성된 경우, 관련 정보는 지체 없이
                삭제합니다. 단, 관련 법령에 따라 보관이 필요한 정보는 해당 기간 동안 보관될 수 있습니다.
              </li>
            </ul>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">4. 개인정보의 파기 절차 및 방법</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스 제공 목적이 달성되었거나 개인정보 보유 기간이 종료된 경우, 해당 개인정보는
              지체 없이 파기합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              전자적 파일 형태의 개인정보는 복구할 수 없는 방식으로 삭제하며, 출력물 등 별도 매체에
              저장된 개인정보가 있는 경우 분쇄 또는 이에 준하는 방법으로 파기합니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">5. 외부 서비스 이용</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 인증 및 데이터 저장을 위해 다음 외부 서비스를 사용할 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Google OAuth: 사용자 로그인 및 인증</li>
              <li>Supabase: 사용자 인증, 데이터 저장 및 서비스 운영에 필요한 데이터베이스 제공</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              각 외부 서비스의 개인정보 처리 방식은 해당 서비스의 개인정보처리방침 및 이용약관을
              따릅니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">6. 개인정보의 제3자 제공</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 동의가
              있거나 법령에 따라 요구되는 경우에는 예외적으로 제공될 수 있습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">7. 개인정보의 안전성 확보조치</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 개인정보가 분실, 도난, 유출, 위조, 변조 또는 훼손되지 않도록 필요한 보호조치를
              위해 노력합니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>인증 기반 접근 관리</li>
              <li>데이터베이스 접근 권한 관리</li>
              <li>서비스 운영에 필요한 최소한의 정보 처리</li>
              <li>외부 인증 및 데이터 저장 서비스의 보안 기능 활용</li>
            </ul>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">8. 이용자 입력 정보 및 책임의 범위</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 이용자가 직접 입력하거나 공유한 일정, 방 이름, 초대 링크, 메모 등의 내용을
              사전에 검토하지 않습니다. 해당 정보의 정확성, 적법성 및 공유 범위에 대한 책임은 해당
              정보를 입력하거나 공유한 이용자에게 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 개인정보 보호를 위해 합리적인 보호조치를 취하고 있으나, 이용자가 초대 링크,
              비밀번호 또는 계정 정보를 제3자에게 직접 공유하여 발생한 문제에 대해서는 책임을
              부담하지 않습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              또한 Google OAuth, Supabase 등 외부 서비스의 장애, 정책 변경 또는 이용자의 외부 계정
              관리 부주의로 인해 발생하는 문제는 각 외부 서비스의 정책 및 이용약관에 따릅니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">9. 이용자의 권리</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 본인의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.
              개인정보와 관련한 요청은 아래 문의처를 통해 접수할 수 있습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">10. 문의처</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              개인정보 처리와 관련한 문의는 아래 이메일로 연락해 주세요.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이메일:{" "}
              <a className="font-medium text-foreground hover:text-primary" href="mailto:devwoo97@gmail.com">
                devwoo97@gmail.com
              </a>
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">11. 시행일</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              본 개인정보처리방침은 2026년 5월 8일부터 적용됩니다.
            </p>
          </section>

          <div className="mt-8 flex flex-wrap gap-3 border-t pt-5 text-sm">
            <Link className="font-medium text-primary" href="/terms">
              이용약관 보기
            </Link>
            <Link className="font-medium text-muted-foreground hover:text-foreground" href="/rooms">
              서비스로 돌아가기
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
