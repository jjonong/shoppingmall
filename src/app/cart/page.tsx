import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { removeCartItem, updateCartQuantity } from "@/app/actions/cart";
import { requireUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "장바구니" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  // 담은 뒤에 판매 중지되거나 재고가 줄어든 상품이 있으면 주문할 수 없습니다.
  const problems = items.filter((i) => !i.product.isActive || i.quantity > i.product.stock);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">장바구니가 비어 있습니다</h1>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-white">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">장바구니</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
          {items.map((item) => {
            const unavailable = !item.product.isActive;
            const overStock = item.quantity > item.product.stock;
            return (
              <li key={item.id} className="flex gap-4 py-4">
                <Link
                  href={`/products/${item.productId}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="96px" className="object-cover" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link href={`/products/${item.productId}`} className="truncate hover:underline">
                      {item.product.name}
                    </Link>
                    <form action={removeCartItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="text-sm text-gray-400 hover:text-black" aria-label={`${item.product.name} 삭제`}>
                        삭제
                      </button>
                    </form>
                  </div>
                  <p className="text-sm text-gray-500">{formatPrice(item.product.price)}</p>

                  {unavailable && <p className="mt-1 text-sm text-red-600">판매가 종료된 상품입니다.</p>}
                  {!unavailable && overStock && (
                    <p className="mt-1 text-sm text-red-600">
                      재고가 부족합니다. (남은 재고 {item.product.stock}개)
                    </p>
                  )}

                  <div className="mt-auto flex items-end justify-between pt-2">
                    {/* 수량 변경: -/+ 버튼이 각각 바뀐 수량을 서버로 보냅니다 */}
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <form action={updateCartQuantity}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity - 1} />
                        <button type="submit" className="px-3 py-1 disabled:text-gray-300" disabled={item.quantity <= 1} aria-label="수량 줄이기">
                          −
                        </button>
                      </form>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <form action={updateCartQuantity}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          className="px-3 py-1 disabled:text-gray-300"
                          disabled={item.quantity >= item.product.stock}
                          aria-label="수량 늘리기"
                        >
                          +
                        </button>
                      </form>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-xl bg-gray-50 p-5">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">상품 금액</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">배송비</dt>
              <dd>무료</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
              <dt>결제 예정 금액</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          {problems.length > 0 ? (
            <p className="mt-4 text-sm text-red-600">주문할 수 없는 상품이 있습니다. 수량을 조정하거나 삭제해주세요.</p>
          ) : (
            <Link
              href="/checkout"
              className="mt-4 block rounded-lg bg-black py-3 text-center font-semibold text-white hover:bg-gray-800"
            >
              주문하기
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
