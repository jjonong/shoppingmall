import type { Metadata } from "next";
import Link from "next/link";
import { updateOrderStatus } from "@/app/actions/admin";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import type { OrderStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { NEXT_STATUSES, ORDER_STATUS } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "주문 관리" };

const ACTION_LABEL: Record<OrderStatus, string> = {
  PAID: "결제완료로 변경",
  SHIPPING: "배송 시작",
  DELIVERED: "배송 완료 처리",
  CANCELLED: "주문 취소",
};

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const status = typeof statusParam === "string" && statusParam in ORDER_STATUS ? (statusParam as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  const tabClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">주문 관리</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tabClass(!status)}>
          전체
        </Link>
        {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={tabClass(status === s)}>
            {ORDER_STATUS[s].label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="py-20 text-center text-gray-500">주문이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-gray-500">
                  #{order.id} · {order.createdAt.toLocaleString("ko-KR")} · {order.user.name} ({order.user.email})
                </span>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="mt-2 text-sm">
                {order.items.map((i) => (
                  <li key={i.id}>
                    {i.product.name} × {i.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-sm text-gray-500">
                {order.recipientName} · {order.phone} · {order.address}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{formatPrice(order.totalPrice)}</span>
                {/* 현재 상태에서 바꿀 수 있는 다음 상태만 버튼으로 보여줍니다 */}
                <div className="flex gap-2">
                  {NEXT_STATUSES[order.status].map((next) => (
                    <form key={next} action={updateOrderStatus}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="status" value={next} />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          next === "CANCELLED"
                            ? "border border-red-300 text-red-600 hover:bg-red-50"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {ACTION_LABEL[next]}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
