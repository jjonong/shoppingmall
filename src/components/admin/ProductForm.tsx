"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct, updateProduct } from "@/app/actions/admin";
import FormField from "@/components/auth/FormField";
import type { ProductFormValues } from "@/lib/definitions";

type Props = {
  categories: { id: number; name: string }[];
  // 수정일 때만 전달합니다. 없으면 새 상품 등록.
  product?: { id: number } & Required<ProductFormValues>;
};

function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul id={id} className="mt-1 text-sm text-red-600">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

export default function ProductForm({ categories, product }: Props) {
  const [state, action, pending] = useActionState(product ? updateProduct : createProduct, undefined);
  // 에러로 돌아왔을 때는 방금 입력한 값을, 처음에는 기존 상품 값을 보여줍니다.
  const v: ProductFormValues = state?.values ?? product ?? { isActive: "on" };
  const e = state?.errors;
  // key: 제출 결과가 바뀔 때마다 입력칸을 새로 그려서 defaultValue가 반영되게 합니다.
  const formKey = JSON.stringify(state?.values ?? null);

  return (
    <form key={formKey} action={action} className="max-w-xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <FormField label="상품명" name="name" defaultValue={v.name} errors={e?.name} />

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          상품 설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={v.description}
          aria-invalid={!!e?.description}
          aria-describedby={e?.description ? "description-error" : undefined}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black aria-invalid:border-red-500"
        />
        <FieldErrors id="description-error" errors={e?.description} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="가격 (원)" name="price" type="number" defaultValue={v.price} errors={e?.price} />
        <FormField label="재고 (개)" name="stock" type="number" defaultValue={v.stock} errors={e?.stock} />
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={v.categoryId ?? ""}
          aria-invalid={!!e?.categoryId}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black aria-invalid:border-red-500"
        >
          <option value="" disabled>
            선택하세요
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldErrors id="categoryId-error" errors={e?.categoryId} />
      </div>

      <FormField
        label="이미지 주소"
        name="imageUrl"
        type="url"
        placeholder="https://picsum.photos/seed/내상품/600/600"
        defaultValue={v.imageUrl}
        errors={e?.imageUrl}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={v.isActive === "on"} className="size-4" />
        판매중 (체크 해제하면 쇼핑몰에 표시되지 않습니다)
      </label>

      <div className="flex gap-3 pt-2">
        <Link href="/admin/products" className="flex-1 rounded-lg border border-gray-300 py-3 text-center hover:border-black">
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-black py-3 font-semibold text-white disabled:bg-gray-400"
        >
          {pending ? "저장 중..." : product ? "수정 저장" : "상품 등록"}
        </button>
      </div>
    </form>
  );
}
