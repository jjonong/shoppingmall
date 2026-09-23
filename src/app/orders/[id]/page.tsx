import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelOrder } from "@/app/actions/order";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { requireUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "주문 상세" };

export default async function OrderDetailPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/orders/${id}`);

  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  // userId 조건으로 "본인 주문만" 조회합니다. 남의 주문번호를 넣어도 404가 됩니다.
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {placed && (
        <div className="mb-6 rounded-xl bg-green-50 p-5 text-center text-green-800">
          <p className="text-lg font-bold">주문이 완료되었습니다!</p>
          <p className="mt-1 text-sm">주문번호 {order.id}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">주문 상세</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-gray-500">
        주문번호 {order.id} · {order.createdAt.toLocaleString("ko-KR")}
      </p>

      <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate">{item.product.name}</p>
              <p className="text-sm text-gray-500">
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="flex justify-between py-4 text-lg font-bold">
        <span>총 결제 금액</span>
        <span>{formatPrice(order.totalPrice)}</span>
      </div>

      <h2 className="mt-4 mb-2 font-semibold">배송 정보</h2>
      <dl className="space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
        <div className="flex gap-4">
          <dt className="w-20 text-gray-500">받는 분</dt>
          <dd>{order.recipientName}</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-20 text-gray-500">연락처</dt>
          <dd>{order.phone}</dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-20 text-gray-500">주소</dt>
          <dd>{order.address}</dd>
        </div>
      </dl>

      <div className="mt-8 flex gap-3">
        <Link href="/orders" className="flex-1 rounded-lg border border-gray-300 py-3 text-center hover:border-black">
          주문 목록
        </Link>
        {order.status === "PAID" && (
          <form action={cancelOrder} className="flex-1">
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="w-full rounded-lg border border-red-300 py-3 text-red-600 hover:bg-red-50">
              주문 취소
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
