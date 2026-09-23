import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "상품 수정" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">상품 수정</h1>
      <ProductForm
        categories={categories}
        // 폼은 문자열 값을 다루므로 숫자/불리언을 문자열로 바꿔서 넘깁니다.
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          imageUrl: product.imageUrl,
          categoryId: String(product.categoryId),
          isActive: product.isActive ? "on" : "",
        }}
      />
    </div>
  );
}
