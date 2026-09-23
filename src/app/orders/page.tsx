import type { Metadata } from "next";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { requireUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "주문 내역" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">주문 내역</h1>

      {orders.length === 0 ? (
        <p className="py-20 text-center text-gray-500">아직 주문한 상품이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const [first, ...rest] = order.items;
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border border-gray-200 p-4 hover:border-black"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {order.createdAt.toLocaleDateString("ko-KR")} · 주문번호 {order.id}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 truncate">
                    {first?.product.name}
                    {rest.length > 0 && ` 외 ${rest.length}건`}
                  </p>
                  <p className="mt-1 font-semibold">{formatPrice(order.totalPrice)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
