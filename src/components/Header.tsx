import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold whitespace-nowrap">
          바이브샵
        </Link>
        <nav className="hidden sm:block">
          <Link href="/products" className="text-sm text-gray-700 hover:text-black">
            전체상품
          </Link>
        </nav>

        {/* 검색: form의 GET 요청으로 /products?q=검색어 로 이동합니다 (JS 없이도 동작) */}
        <form action="/products" className="ml-auto flex-1 sm:max-w-xs">
          <input
            name="q"
            type="search"
            placeholder="상품 검색"
            className="w-full rounded-full border border-gray-300 px-4 py-1.5 text-sm outline-none focus:border-black"
          />
        </form>
      </div>
    </header>
  );
}
