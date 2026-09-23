"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import FormField from "./FormField";

export default function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <FormField
        label="이름"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name}
        errors={state?.errors?.name}
      />
      <FormField
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        errors={state?.errors?.email}
      />
      <FormField
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="영문, 숫자 포함 8자 이상"
        errors={state?.errors?.password}
      />
      <FormField
        label="비밀번호 확인"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        errors={state?.errors?.passwordConfirm}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black py-3 font-semibold text-white disabled:bg-gray-400"
      >
        {pending ? "가입 중..." : "회원가입"}
      </button>

      <p className="text-center text-sm text-gray-500">
        이미 회원이신가요?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-black underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
