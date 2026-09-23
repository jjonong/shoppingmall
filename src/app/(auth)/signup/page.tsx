import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";
import { safeRedirectPath } from "@/lib/definitions";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const safeNext = safeRedirectPath(next, "");

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">회원가입</h1>
      <SignupForm next={safeNext || undefined} />
    </div>
  );
}
