import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// 주문을 취소하고 재고를 되돌립니다. 반드시 트랜잭션(tx) 안에서 호출하세요.
// '결제완료(PAID)' 상태인 주문만 취소되며, 취소했으면 true를 반환합니다.
// (고객의 주문 취소와 관리자의 주문 취소가 함께 사용합니다.)
export async function cancelPaidOrder(tx: Prisma.TransactionClient, where: Prisma.OrderWhereInput) {
  const order = await tx.order.findFirst({ where: { ...where, status: "PAID" }, include: { items: true } });
  if (!order) return false;

  // status 조건을 함께 걸어서, 동시에 두 번 취소 요청이 와도 재고가 두 번 복구되지 않게 합니다.
  const { count } = await tx.order.updateMany({
    where: { id: order.id, status: "PAID" },
    data: { status: "CANCELLED" },
  });
  if (count === 0) return false;

  for (const item of order.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
  return true;
}
