import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { requireUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "주문서 작성" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  // 장바구니가 비었거나 주문 불가능한 상품이 있으면 장바구니에서 먼저 정리하게 합니다.
  if (items.length === 0 || items.some((i) => !i.product.isActive || i.quantity > i.product.stock)) {
    redirect("/cart");
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">주문서 작성</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <section>
          <h2 className="mb-4 font-semibold">배송 정보</h2>
          <CheckoutForm defaultName={user.name} total={total} />
        </section>

        <aside className="h-fit rounded-xl bg-gray-50 p-5">
          <h2 className="mb-3 font-semibold">주문 상품 {items.length}개</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="truncate text-gray-600">
                  {i.product.name} × {i.quantity}
                </span>
                <span className="shrink-0">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 font-bold">
            <span>총 결제 금액</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
