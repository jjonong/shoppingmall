"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import FormField from "./FormField";

export default function LoginForm({ next }: { next?: string }) {
  // useActionState: Server Action의 반환값(에러 등)을 state로 받고, 제출 중인지(pending)도 알려줍니다.
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state?.message && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

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
        autoComplete="current-password"
        errors={state?.errors?.password}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-black py-3 font-semibold text-white disabled:bg-gray-400"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>

      <p className="text-center text-sm text-gray-500">
        아직 회원이 아니신가요?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-black underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
