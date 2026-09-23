import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "전체상품" };

const SORTS = {
  new: { label: "최신순", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "낮은 가격순", orderBy: { price: "asc" } },
  "price-desc": { label: "높은 가격순", orderBy: { price: "desc" } },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }>;

type SortKey = keyof typeof SORTS;

// ?a=1&a=2 처럼 값이 배열로 올 수도 있어서 첫 번째 문자열만 사용합니다.
function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const category = first(params.category) ?? "";
  const sortParam = first(params.sort) ?? "";
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : "new";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q && { name: { contains: q } }),
    ...(category && { category: { slug: category } }),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy: SORTS[sort].orderBy }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  // 현재 필터를 유지하면서 일부 값만 바꾼 URL을 만듭니다.
  function hrefWith(changes: Record<string, string>) {
    const next = new URLSearchParams({ q, category, sort, ...changes });
    for (const [key, value] of [...next.entries()]) if (!value) next.delete(key);
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const tabClass = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm ${active ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`;

  return (
    <div>
      <h1 className="text-2xl font-bold">{q ? `"${q}" 검색 결과` : "전체상품"}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={hrefWith({ category: "" })} className={tabClass(!category)}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={hrefWith({ category: c.slug })} className={tabClass(category === c.slug)}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-3 text-sm">
        <span className="text-gray-500">총 {products.length}개</span>
        <div className="flex gap-3">
          {(Object.keys(SORTS) as SortKey[]).map((key) => (
            <Link
              key={key}
              href={hrefWith({ sort: key })}
              className={sort === key ? "font-semibold" : "text-gray-500 hover:text-black"}
            >
              {SORTS[key].label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-gray-500">조건에 맞는 상품이 없습니다.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
