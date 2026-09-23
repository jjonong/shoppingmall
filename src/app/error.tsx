"use client"; // 에러 화면은 클라이언트 컴포넌트여야 합니다.

import Link from "next/link";
import { useEffect } from "react";

// 페이지를 그리다가 예상치 못한 에러(DB 연결 실패 등)가 나면 이 화면이 대신 보입니다.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
      <p className="mt-2 text-gray-500">잠시 후 다시 시도해주세요.</p>
      {error.digest && <p className="mt-1 text-xs text-gray-400">오류 코드: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => retry()} className="rounded-full bg-black px-6 py-2.5 text-white">
          다시 시도
        </button>
        <Link href="/" className="rounded-full border border-gray-300 px-6 py-2.5 hover:border-black">
          홈으로
        </Link>
      </div>
    </div>
  );
}
