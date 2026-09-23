"use client";

import { useActionState } from "react";
import { placeOrder } from "@/app/actions/order";
import FormField from "@/components/auth/FormField";
import { formatPrice } from "@/lib/format";

export default function CheckoutForm({ defaultName, total }: { defaultName: string; total: number }) {
  const [state, action, pending] = useActionState(placeOrder, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <FormField
        label="받는 분"
        name="recipientName"
        autoComplete="name"
        defaultValue={state?.values?.recipientName ?? defaultName}
        errors={state?.errors?.recipientName}
      />
      <FormField
        label="휴대폰 번호"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="010-1234-5678"
        defaultValue={state?.values?.phone}
        errors={state?.errors?.phone}
      />
      <FormField
        label="배송지 주소"
        name="address"
        autoComplete="street-address"
        placeholder="서울시 강남구 테헤란로 123, 101동 101호"
        defaultValue={state?.values?.address}
        errors={state?.errors?.address}
      />

      <p className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
        학습용 쇼핑몰이라 실제 결제는 진행되지 않고, 주문하면 바로 &apos;결제완료&apos; 상태가 됩니다.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black py-3.5 font-semibold text-white disabled:bg-gray-400"
      >
        {pending ? "주문 처리 중..." : `${formatPrice(total)} 결제하기`}
      </button>
    </form>
  );
}
