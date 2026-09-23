import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { toggleProductActive } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  await requireAdmin();
  // 관리자는 판매중지 상품도 모두 봅니다.
  const products = await prisma.product.findMany({ orderBy: { id: "desc" }, include: { category: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          + 상품 등록
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500">
            <tr>
              <th className="py-2 font-medium">상품</th>
              <th className="py-2 font-medium">카테고리</th>
              <th className="py-2 text-right font-medium">가격</th>
              <th className="py-2 text-right font-medium">재고</th>
              <th className="py-2 text-center font-medium">상태</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className={p.isActive ? "" : "text-gray-400"}>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <span className="max-w-56 truncate">{p.name}</span>
                  </div>
                </td>
                <td className="py-2">{p.category.name}</td>
                <td className="py-2 text-right">{formatPrice(p.price)}</td>
                <td className={`py-2 text-right ${p.stock === 0 ? "font-semibold text-red-600" : ""}`}>{p.stock}</td>
                <td className="py-2 text-center">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      title="클릭하면 판매 상태가 바뀝니다"
                      className={`rounded px-2 py-0.5 text-xs ${p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {p.isActive ? "판매중" : "판매중지"}
                    </button>
                  </form>
                </td>
                <td className="py-2 text-right">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-gray-500 underline hover:text-black">
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
