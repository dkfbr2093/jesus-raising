import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "예수 키우기",
  description: "클릭으로 사랑을 모아 10단계의 빛나는 진화를 완성하는 게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
