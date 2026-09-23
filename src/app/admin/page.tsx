import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "관리자 대시보드" };

const LOW_STOCK = 5;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [statusCounts, revenue, userCount, lowStock] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: LOW_STOCK } },
      orderBy: { stock: "asc" },
      select: { id: true, name: true, stock: true },
    }),
  ]);

  const countOf = (status: keyof typeof ORDER_STATUS) => statusCounts.find((s) => s.status === status)?._count ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="총 매출 (취소 제외)" value={formatPrice(revenue._sum.totalPrice ?? 0)} />
        <Stat label="처리할 주문 (결제완료)" value={`${countOf("PAID")}건`} href="/admin/orders?status=PAID" />
        <Stat label="배송중" value={`${countOf("SHIPPING")}건`} href="/admin/orders?status=SHIPPING" />
        <Stat label="일반 회원" value={`${userCount}명`} />
      </div>

      <section>
        <h2 className="mb-3 font-semibold">재고 부족 상품 ({LOW_STOCK}개 이하)</h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-gray-500">재고가 부족한 상품이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{p.name}</span>
                <span className="flex items-center gap-4">
                  <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-amber-600"}>
                    {p.stock === 0 ? "품절" : `${p.stock}개`}
                  </span>
                  <Link href={`/admin/products/${p.id}/edit`} className="text-gray-500 underline hover:text-black">
                    수정
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </>
  );
  const className = "block rounded-xl border border-gray-200 p-4";
  return href ? (
    <Link href={href} className={`${className} hover:border-black`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
