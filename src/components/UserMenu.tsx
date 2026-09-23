import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";

// 로그인 상태에 따라 헤더 오른쪽 메뉴를 다르게 보여줍니다.
export default async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm whitespace-nowrap">
        <Link href="/login" className="hover:underline">
          로그인
        </Link>
        <Link href="/signup" className="hover:underline">
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm whitespace-nowrap">
      {user.role === "ADMIN" && (
        <span className="rounded bg-black px-1.5 py-0.5 text-xs text-white">관리자</span>
      )}
      <Link href="/mypage" className="hover:underline">
        {user.name}님
      </Link>
      <form action={logout}>
        <button type="submit" className="text-gray-500 hover:text-black">
          로그아웃
        </button>
      </form>
    </div>
  );
}
