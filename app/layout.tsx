import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사랑 키우기",
  description: "클릭으로 사랑을 모아 10단계의 따뜻한 여정을 완성하는 게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
