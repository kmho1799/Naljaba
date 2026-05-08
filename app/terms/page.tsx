import Link from "next/link";

import { Logo } from "@/components/logo";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Logo />
        </div>

        <article className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-primary">Naljaba</p>
          <h1 className="mt-2 text-3xl font-bold">Naljaba 이용약관</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            본 이용약관은 Naljaba(이하 “서비스”)의 공동 캘린더 서비스를 이용할 때 필요한
            기본 사항을 정한 문서입니다. 이용자는 서비스를 이용함으로써 본 약관에 동의한
            것으로 봅니다.
          </p>

          <section className="mt-8 space-y-3">
            <h2 className="text-lg font-bold">1. 서비스 개요</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 사용자가 방을 생성하고 초대 링크를 공유하여 여러 사람이 각자의 일정을
              입력한 뒤, 함께 가능한 날짜를 확인할 수 있도록 돕는 공동 캘린더 서비스입니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">2. 계정 이용</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 Google 계정으로 로그인하여 서비스를 이용할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 본인의 계정 접근 권한, 로그인 상태 및 외부 계정 관리에 대한 책임을 부담합니다.
              이용자의 계정 관리 부주의로 인해 발생한 문제에 대해서는 서비스가 책임을 부담하지 않습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">3. 방 생성 및 초대 링크 관리</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 방을 생성하고 방 이름, 비밀번호 등 필요한 정보를 설정할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              방장 또는 이용자는 초대 링크와 비밀번호를 다른 사람에게 공유할 수 있습니다. 초대 링크와
              비밀번호를 받은 사람은 해당 방에 입장할 수 있으므로, 이용자는 공유 범위와 전달 대상에
              주의해야 합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자가 초대 링크, 비밀번호 또는 방 정보를 직접 공유하여 발생한 문제에 대해서는 해당
              이용자에게 책임이 있습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">4. 일정 입력 및 공유</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 서비스 내에서 본인의 일정 정보를 입력할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자가 입력한 일정 정보는 해당 방의 멤버에게 공유될 수 있습니다. 이용자는 이를
              충분히 이해한 뒤 일정을 입력해야 합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 허위 정보, 타인의 개인정보, 타인의 권리를 침해하는 내용, 법령 또는 공서양속에
              반하는 내용을 입력해서는 안 됩니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">5. 이용자의 책임</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 서비스를 관련 법령, 본 약관 및 서비스의 이용 목적에 맞게 이용해야 합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자가 직접 입력하거나 공유한 일정, 방 이름, 메모, 초대 링크, 비밀번호 등의 정보에
              대한 정확성, 적법성 및 공유 범위에 대한 책임은 해당 이용자에게 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 이용자가 직접 입력한 정보를 사전에 검토하지 않으며, 이용자 간 공유된 정보로
              인해 발생한 분쟁에 대해서는 원칙적으로 개입하거나 책임을 부담하지 않습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">6. 제한 행위</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              이용자는 다음 행위를 해서는 안 됩니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>다른 이용자의 계정 또는 정보를 무단으로 이용하는 행위</li>
              <li>타인의 개인정보를 동의 없이 입력하거나 공유하는 행위</li>
              <li>허위 정보 또는 타인의 권리를 침해하는 내용을 입력하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>초대 링크, 비밀번호 등을 악용하여 무단으로 방에 접근하는 행위</li>
              <li>법령 또는 공서양속에 반하는 방식으로 서비스를 이용하는 행위</li>
              <li>서비스의 보안, 데이터, 시스템에 비정상적으로 접근하거나 이를 훼손하려는 행위</li>
            </ul>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">7. 서비스의 변경 및 중단</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 운영상, 기술상 필요에 따라 기능, 화면, 정책 또는 제공 방식을 변경할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 안정적인 운영을 위해 노력하지만, 외부 서비스 장애, 서버 장애, 네트워크 문제,
              점검, 정책 변경 또는 불가항력적인 사유로 인해 서비스의 전부 또는 일부가 일시적으로
              중단될 수 있습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">8. 외부 서비스 이용</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 로그인, 인증 및 데이터 저장 등을 위해 Google OAuth, Supabase 등 외부 서비스를
              사용할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              외부 서비스의 장애, 정책 변경, 제공 범위 변경 또는 이용자의 외부 계정 관리 부주의로 인해
              발생하는 문제는 각 외부 서비스의 정책 및 이용약관에 따릅니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">9. 개인정보 보호</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 이용자의 개인정보를 관련 법령 및 개인정보처리방침에 따라 처리합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              개인정보의 수집, 이용, 보관, 삭제 및 이용자의 권리에 관한 사항은 별도의
              개인정보처리방침에서 확인할 수 있습니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">10. 책임의 제한</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 이용자가 서비스를 원활하게 이용할 수 있도록 합리적인 범위에서 노력합니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              다만, 다음 사유로 인해 발생한 손해나 문제에 대해서는 서비스가 책임을 부담하지 않습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              <li>이용자의 계정 관리 부주의</li>
              <li>이용자가 직접 입력하거나 공유한 정보로 인한 문제</li>
              <li>초대 링크, 비밀번호 또는 방 정보의 직접 공유로 인한 문제</li>
              <li>이용자 간 분쟁</li>
              <li>외부 서비스의 장애, 정책 변경 또는 제공 중단</li>
              <li>천재지변, 네트워크 장애, 서버 장애 등 서비스가 통제하기 어려운 사유</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              단, 서비스의 고의 또는 중대한 과실로 인해 발생한 손해에 대해서는 관련 법령에 따릅니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">11. 약관의 변경</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스는 필요한 경우 본 약관을 변경할 수 있습니다. 약관이 변경되는 경우 서비스 화면
              또는 별도 공지 수단을 통해 안내할 수 있습니다.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              변경된 약관의 적용일 이후에도 서비스를 계속 이용하는 경우, 이용자는 변경된 약관에
              동의한 것으로 봅니다.
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">12. 문의</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              서비스 이용과 관련한 문의는 아래 이메일로 연락해 주세요.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              이메일:{" "}
              <a className="font-medium text-foreground hover:text-primary" href="mailto:devwoo97@gmail.com">
                devwoo97@gmail.com
              </a>
            </p>
          </section>

          <section className="mt-7 space-y-3">
            <h2 className="text-lg font-bold">13. 시행일</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              본 이용약관은 2026년 5월 8일부터 적용됩니다.
            </p>
          </section>

          <div className="mt-8 flex flex-wrap gap-3 border-t pt-5 text-sm">
            <Link className="font-medium text-primary" href="/privacy">
              개인정보처리방침 보기
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
