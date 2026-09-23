"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import type { OrderStatus } from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/dal";
import { ProductSchema, type ProductFormState, type ProductFormValues } from "@/lib/definitions";
import { NEXT_STATUSES } from "@/lib/order-status";
import { cancelPaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

// 모든 관리자 액션은 첫 줄에서 requireAdmin()으로 권한을 확인합니다.
// Server Action은 누구나 직접 호출할 수 있는 API와 같기 때문에, 화면에서 버튼을 숨기는 것만으로는 안전하지 않습니다.

function readProductForm(formData: FormData) {
  const values: ProductFormValues = {};
  for (const key of ["name", "description", "price", "stock", "imageUrl", "categoryId", "isActive"] as const) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }
  return values;
}

async function categoryExists(id: number) {
  return (await prisma.category.count({ where: { id } })) > 0;
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const values = readProductForm(formData);
  const parsed = ProductSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };
  if (!(await categoryExists(parsed.data.categoryId))) {
    return { errors: { categoryId: ["존재하지 않는 카테고리입니다."] }, values };
  }

  await prisma.product.create({ data: parsed.data });
  redirect("/admin/products");
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const values = readProductForm(formData);
  if (!Number.isInteger(id) || id <= 0) return { message: "잘못된 상품입니다.", values };

  const parsed = ProductSchema.safeParse(values);
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };
  if (!(await categoryExists(parsed.data.categoryId))) {
    return { errors: { categoryId: ["존재하지 않는 카테고리입니다."] }, values };
  }

  const { count } = await prisma.product.updateMany({ where: { id }, data: parsed.data });
  if (count === 0) return { message: "상품을 찾을 수 없습니다.", values };
  redirect("/admin/products");
}

// 상품은 주문 내역에서 참조하므로 삭제하지 않고 '판매중지'로 숨깁니다.
export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  refresh();
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  const next = formData.get("status") as OrderStatus;
  if (!Number.isInteger(orderId) || orderId <= 0) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  // 허용된 순서로만 바꿀 수 있습니다 (예: 배송완료 → 결제완료 같은 역방향 변경 불가).
  if (!order || !NEXT_STATUSES[order.status].includes(next)) return;

  if (next === "CANCELLED") {
    await prisma.$transaction((tx) => cancelPaidOrder(tx, { id: orderId }));
  } else {
    // 현재 상태 조건을 함께 걸어서, 그 사이에 고객이 취소한 주문은 바뀌지 않게 합니다.
    await prisma.order.updateMany({ where: { id: orderId, status: order.status }, data: { status: next } });
  }
  refresh();
}
