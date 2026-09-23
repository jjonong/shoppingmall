import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-gray-500">주소가 잘못되었거나 판매가 종료된 상품일 수 있어요.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-white">
        홈으로
      </Link>
    </div>
  );
}
