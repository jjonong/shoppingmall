import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { readSessionCookie } from "@/lib/session";

// Data Access Layer: "지금 로그인한 사람이 누구인지"를 확인하는 코드를 한 곳에 모아둡니다.
// 페이지와 Server Action은 반드시 이 함수들로 권한을 확인하세요.
// (proxy.ts의 검사는 빠른 1차 필터일 뿐, 보안의 최종 방어선이 아닙니다.)

// cache: 한 번의 요청 안에서 여러 컴포넌트가 호출해도 DB 조회는 한 번만 합니다.
export const getCurrentUser = cache(async () => {
  const session = await readSessionCookie();
  if (!session) return null;

  // 쿠키의 role은 로그인 시점 값이므로, 권한은 항상 DB의 최신 값을 기준으로 판단합니다.
  // 비밀번호 해시 등 민감한 필드는 select 하지 않습니다.
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

// 로그인이 필요한 페이지/액션에서 사용. 로그인 안 했으면 로그인 페이지로 보냅니다.
export async function requireUser(returnTo?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
  return user;
}

// 관리자만 접근 가능한 페이지/액션에서 사용.
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
