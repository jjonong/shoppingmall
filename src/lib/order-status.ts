import type { OrderStatus } from "@/generated/prisma/enums";

// 주문 상태를 화면에 보여줄 한국어 이름과 색상 (주문 내역, 관리자 페이지에서 함께 사용)
export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  PAID: { label: "결제완료", className: "bg-blue-50 text-blue-700" },
  SHIPPING: { label: "배송중", className: "bg-amber-50 text-amber-700" },
  DELIVERED: { label: "배송완료", className: "bg-green-50 text-green-700" },
  CANCELLED: { label: "주문취소", className: "bg-gray-100 text-gray-500" },
};
