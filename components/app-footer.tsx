import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>© 2026 Naljaba. All rights reserved.</p>
          <p>
            문의:{" "}
            <a className="font-medium text-foreground hover:text-primary" href="mailto:devwoo97@gmail.com">
              devwoo97@gmail.com
            </a>
          </p>
        </div>
        <nav className="flex items-center gap-2 font-medium text-foreground">
          <Link href="/privacy" className="hover:text-primary">
            개인정보처리방침
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/terms" className="hover:text-primary">
            이용약관
          </Link>
        </nav>
      </div>
    </footer>
  );
}
