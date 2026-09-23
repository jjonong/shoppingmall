import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS } from "@/lib/order-status";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = ORDER_STATUS[status];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
