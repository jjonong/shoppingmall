import Link from "next/link";

// 관리자 메뉴 레이아웃. 권한 확인은 레이아웃이 아니라 각 페이지/액션에서 requireAdmin()으로 합니다.
// (레이아웃은 페이지 이동 시 다시 실행되지 않을 수 있어 보안 검사 위치로 적합하지 않습니다.)
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const links = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/products", label: "상품 관리" },
    { href: "/admin/orders", label: "주문 관리" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        <p className="hidden px-3 pb-2 text-xs font-semibold text-gray-400 md:block">관리자</p>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-gray-100">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
