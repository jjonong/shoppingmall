"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/dal";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";

export type CartActionState = { ok: boolean; message: string } | undefined;

// 폼 값을 1 이상의 정수로 변환합니다. 숫자가 아니면 null.
function toPositiveInt(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function addToCart(_prev: CartActionState, formData: FormData): Promise<CartActionState> {
  const productId = toPositiveInt(formData.get("productId"));
  const quantity = toPositiveInt(formData.get("quantity"));
  // 로그인하지 않았으면 로그인 후 이 상품 페이지로 돌아오게 합니다.
  const user = await requireUser(productId ? `/products/${productId}` : "/products");

  if (!productId || !quantity || quantity > MAX_QUANTITY_PER_ITEM) {
    return { ok: false, message: "수량을 확인해주세요." };
  }

  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
  if (!product) return { ok: false, message: "판매 중인 상품이 아닙니다." };

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  const inCart = existing?.quantity ?? 0;
  const newQuantity = inCart + quantity;

  if (newQuantity > product.stock) {
    const detail = inCart > 0 ? ` (장바구니에 이미 ${inCart}개)` : "";
    return { ok: false, message: `재고가 부족합니다. 남은 재고 ${product.stock}개${detail}` };
  }
  if (newQuantity > MAX_QUANTITY_PER_ITEM) {
    return { ok: false, message: `한 상품은 최대 ${MAX_QUANTITY_PER_ITEM}개까지 담을 수 있습니다.` };
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId, quantity },
    update: { quantity: newQuantity },
  });

  refresh(); // 헤더의 장바구니 개수 등 화면을 최신 데이터로 다시 그립니다.
  return { ok: true, message: `장바구니에 ${quantity}개를 담았습니다.` };
}

export async function updateCartQuantity(formData: FormData) {
  const user = await requireUser("/cart");
  const itemId = toPositiveInt(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));
  if (!itemId || !Number.isInteger(quantity)) return;

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: user.id }, // 다른 사람의 장바구니는 수정할 수 없도록 userId도 확인
    include: { product: true },
  });
  if (!item) return;

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    // 재고와 최대 수량을 넘지 않도록 맞춥니다.
    const clamped = Math.min(quantity, item.product.stock, MAX_QUANTITY_PER_ITEM);
    if (clamped < 1) await prisma.cartItem.delete({ where: { id: item.id } });
    else await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: clamped } });
  }
  refresh();
}

export async function removeCartItem(formData: FormData) {
  const user = await requireUser("/cart");
  const itemId = toPositiveInt(formData.get("itemId"));
  if (!itemId) return;

  await prisma.cartItem.deleteMany({ where: { id: itemId, userId: user.id } });
  refresh();
}
