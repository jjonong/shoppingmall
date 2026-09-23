import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "상품 등록" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">상품 등록</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
