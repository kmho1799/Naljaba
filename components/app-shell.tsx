import { LogOut } from "lucide-react";

import { signOut } from "@/app/actions";
import { AppFooter } from "@/components/app-footer";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";

type AppShellProps = {
  profile?: Profile | null;
  children: React.ReactNode;
};

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between pl-4 pr-3 sm:px-6">
          <div className="pt-1">
            <Logo className="h-11 w-[176px]" mobileMark />
          </div>
          <div className="flex items-center gap-2">
            {profile ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar
                  name={profile.display_name}
                  email={profile.email}
                  src={profile.avatar_url}
                  size="sm"
                />
                <span className="text-sm font-medium">
                  {profile.display_name || profile.email}
                </span>
              </div>
            ) : null}
            <form action={signOut}>
              <Button variant="ghost" size="icon" title="로그아웃">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  );
}
