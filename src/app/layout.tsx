import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "바이브샵", template: "%s | 바이브샵" },
  description: "Next.js로 만든 학습용 쇼핑몰",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          © 바이브샵 · 학습/포트폴리오용 프로젝트
        </footer>
      </body>
    </html>
  );
}
