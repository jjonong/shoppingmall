"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { type AuthFormState, LoginSchema, safeRedirectPath, SignupSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// 존재하지 않는 이메일로 로그인할 때도 bcrypt 비교를 한 번 수행해서,
// 응답 시간 차이로 "가입된 이메일인지" 알아내는 것을 어렵게 합니다.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData);
  const values = { name: String(raw.name ?? ""), email: String(raw.email ?? "") };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { name, email, password } = parsed.data;
  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
      select: { id: true, role: true },
    });
  } catch (e) {
    // P2002: unique 제약 위반 = 이미 가입된 이메일
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { errors: { email: ["이미 가입된 이메일입니다."] }, values };
    }
    throw e;
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(safeRedirectPath(formData.get("next")));
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: String(formData.get("email") ?? "") };

  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // 이메일이 틀렸는지 비밀번호가 틀렸는지 구분해서 알려주지 않습니다 (계정 존재 여부 노출 방지).
  if (!user || !passwordOk) {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다.", values };
  }

  await createSession({ userId: user.id, role: user.role });
  const fallback = user.role === "ADMIN" ? "/admin" : "/";
  redirect(safeRedirectPath(formData.get("next"), fallback));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
