import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const user = await requireUser("/mypage");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">마이페이지</h1>
      <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        <div className="flex px-4 py-3">
          <dt className="w-24 text-gray-500">이름</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-24 text-gray-500">이메일</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex px-4 py-3">
          <dt className="w-24 text-gray-500">회원등급</dt>
          <dd>{user.role === "ADMIN" ? "관리자" : "일반회원"}</dd>
        </div>
      </dl>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/orders" className="rounded-lg border border-gray-300 py-3 text-center hover:border-black">
          주문 내역
        </Link>
        <Link href="/cart" className="rounded-lg border border-gray-300 py-3 text-center hover:border-black">
          장바구니
        </Link>
      </div>
    </div>
  );
}
