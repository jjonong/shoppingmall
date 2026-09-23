"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireUser } from "@/lib/dal";
import { CheckoutSchema, type CheckoutFormState } from "@/lib/definitions";
import { cancelPaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

// 트랜잭션 안에서 "사용자에게 보여줄 에러"를 구분하기 위한 클래스
class OrderError extends Error {}

export async function placeOrder(_prev: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const user = await requireUser("/checkout");

  const values = {
    recipientName: String(formData.get("recipientName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
  };
  const parsed = CheckoutSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  let orderId: number;
  try {
    // 트랜잭션: 안의 작업이 "전부 성공"하거나 "전부 취소"됩니다.
    // 재고 차감 중간에 실패해도 일부만 차감되는 일이 없습니다.
    orderId = await prisma.$transaction(async (tx) => {
      const items = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
      });
      if (items.length === 0) throw new OrderError("장바구니가 비어 있습니다.");

      for (const item of items) {
        if (!item.product.isActive) {
          throw new OrderError(`'${item.product.name}'은(는) 판매가 종료되었습니다. 장바구니에서 삭제해주세요.`);
        }
        // 조건부 차감: 재고가 충분할 때만 줄입니다. 동시에 여러 명이 주문해도 재고가 음수가 되지 않습니다.
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new OrderError(`'${item.product.name}'의 재고가 부족합니다. (남은 재고 ${item.product.stock}개)`);
        }
      }

      const order = await tx.order.create({
        data: {
          userId: user.id,
          ...parsed.data,
          totalPrice: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
          items: {
            // 주문 시점의 가격을 저장해 두면, 나중에 상품 가격이 바뀌어도 주문 금액은 그대로입니다.
            create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.product.price })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      return order.id;
    });
  } catch (e) {
    if (e instanceof OrderError) return { message: e.message, values };
    throw e;
  }

  redirect(`/orders/${orderId}?placed=1`);
}

export async function cancelOrder(formData: FormData) {
  const user = await requireUser("/orders");
  const orderId = Number(formData.get("orderId"));
  if (!Number.isInteger(orderId) || orderId <= 0) return;

  // 본인 주문이고 아직 '결제완료' 상태일 때만 취소 가능 (배송 시작 후에는 불가)
  await prisma.$transaction((tx) => cancelPaidOrder(tx, { id: orderId, userId: user.id }));

  refresh();
}
