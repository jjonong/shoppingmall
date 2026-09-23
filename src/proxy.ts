import { type NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE_NAME } from "@/lib/session";

// Proxy: 페이지가 렌더링되기 전에 실행되는 1차 검문소입니다.
// 쿠키만 확인하고(DB 조회 X) 빠르게 리다이렉트합니다.
// 실제 권한 확인은 각 페이지/액션에서 lib/dal.ts로 다시 합니다.

const PROTECTED_PREFIXES = ["/mypage", "/cart", "/checkout", "/orders", "/admin"];
const GUEST_ONLY = ["/login", "/signup"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (matches(path, PROTECTED_PREFIXES) && !session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", path + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (matches(path, ["/admin"]) && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 오면 홈으로 보냅니다.
  if (matches(path, GUEST_ONLY) && session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // 정적 파일, 이미지 최적화, 파비콘 등에는 실행하지 않습니다.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
