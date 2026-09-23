import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/definitions";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const safeNext = safeRedirectPath(next, "");

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">로그인</h1>
      <LoginForm next={safeNext || undefined} />
      <p className="mt-8 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
        테스트 계정
        <br />
        일반: user@shop.com / user1234
        <br />
        관리자: admin@shop.com / admin1234
      </p>
    </div>
  );
}
