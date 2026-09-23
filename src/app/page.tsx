import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

// DB 내용이 바뀌면 바로 보이도록, 빌드 시점에 미리 만들지 않고 요청마다 렌더링합니다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newProducts, categories] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gray-900 px-6 py-14 text-center text-white sm:py-20">
        <h1 className="text-3xl font-bold sm:text-4xl">매일 입기 좋은 옷, 바이브샵</h1>
        <p className="mt-3 text-gray-300">새로 들어온 상품을 만나보세요</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 font-semibold text-gray-900 hover:bg-gray-200"
        >
          쇼핑하러 가기
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">카테고리</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="rounded-lg border border-gray-200 py-4 text-center font-medium hover:border-black"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold">신상품</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-black">
            전체보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
