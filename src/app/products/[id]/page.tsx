import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

// generateMetadata와 페이지가 같은 상품을 조회하므로, cache로 한 요청 안에서 DB 조회를 한 번만 하게 합니다.
const getProduct = cache(async (idParam: string) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return prisma.product.findFirst({ where: { id, isActive: true }, include: { category: true } });
});

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product?.name ?? "상품을 찾을 수 없습니다" };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  const soldOut = product.stock <= 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col">
        <Link
          href={`/products?category=${product.category.slug}`}
          className="text-sm text-gray-500 hover:text-black"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
        <p className="mt-4 text-3xl font-bold">{formatPrice(product.price)}</p>
        <p className="mt-2 text-sm text-gray-500">
          {soldOut ? "품절" : `재고 ${product.stock}개`} · 배송비 무료
        </p>

        <p className="mt-6 leading-relaxed whitespace-pre-line text-gray-700">{product.description}</p>

        {/* 장바구니 담기는 5단계에서 구현합니다 */}
        <button
          type="button"
          disabled
          className="mt-8 rounded-lg bg-black py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {soldOut ? "품절" : "장바구니 담기 (준비 중)"}
        </button>
      </div>
    </div>
  );
}
