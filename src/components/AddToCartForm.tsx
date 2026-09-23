"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCart } from "@/app/actions/cart";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/definitions";

export default function AddToCartForm({ productId, stock }: { productId: number; stock: number }) {
  const [state, action, pending] = useActionState(addToCart, undefined);
  const max = Math.min(stock, MAX_QUANTITY_PER_ITEM);

  if (stock <= 0) {
    return (
      <button type="button" disabled className="mt-8 w-full rounded-lg bg-gray-300 py-3.5 font-semibold text-white">
        품절
      </button>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-gray-600">
          수량
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={max}
          defaultValue={1}
          className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black py-3.5 font-semibold text-white disabled:bg-gray-400"
      >
        {pending ? "담는 중..." : "장바구니 담기"}
      </button>

      {state && (
        <p role="status" className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
          {state.ok && (
            <Link href="/cart" className="ml-2 font-medium underline">
              장바구니 보기
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
