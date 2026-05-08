import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "날잡아",
  description: "초대 링크로 모인 사람들이 각자의 일정을 색상별로 입력하고 함께 가능한 날짜를 찾는 공동 캘린더",
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans">
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
