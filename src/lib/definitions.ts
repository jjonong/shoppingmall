import * as z from "zod";

// 폼 입력값 검증 규칙. 서버에서 검증하므로 브라우저 검사를 우회해도 안전합니다.

export const SignupSchema = z
  .object({
    name: z.string().trim().min(2, { error: "이름은 2자 이상 입력해주세요." }).max(20, { error: "이름은 20자 이하로 입력해주세요." }),
    email: z.email({ error: "올바른 이메일 형식이 아닙니다." }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { error: "8자 이상이어야 합니다." })
      .max(72, { error: "72자 이하여야 합니다." }) // bcrypt는 72바이트까지만 사용
      .regex(/[a-zA-Z]/, { error: "영문자를 1개 이상 포함해야 합니다." })
      .regex(/[0-9]/, { error: "숫자를 1개 이상 포함해야 합니다." }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export const LoginSchema = z.object({
  email: z.email({ error: "올바른 이메일 형식이 아닙니다." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "비밀번호를 입력해주세요." }),
});

// Server Action이 폼에 돌려주는 결과. 에러가 난 경우 입력값(비밀번호 제외)을 되돌려줘서 다시 입력하지 않게 합니다.
export type AuthFormState =
  | {
      errors?: Partial<Record<"name" | "email" | "password" | "passwordConfirm", string[]>>;
      message?: string;
      values?: { name?: string; email?: string };
    }
  | undefined;

// 한 상품을 장바구니에 담을 수 있는 최대 수량
export const MAX_QUANTITY_PER_ITEM = 99;

export const CheckoutSchema = z.object({
  recipientName: z.string().trim().min(2, { error: "받는 분 이름을 2자 이상 입력해주세요." }).max(20, { error: "이름은 20자 이하로 입력해주세요." }),
  phone: z
    .string()
    .trim()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, { error: "휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)" }),
  address: z.string().trim().min(5, { error: "배송지 주소를 입력해주세요." }).max(200, { error: "주소가 너무 깁니다." }),
});

export type CheckoutFormState =
  | {
      errors?: Partial<Record<"recipientName" | "phone" | "address", string[]>>;
      message?: string;
      values?: { recipientName?: string; phone?: string; address?: string };
    }
  | undefined;

// 로그인 후 이동할 주소(?next=)가 우리 사이트 내부 경로인지 확인합니다.
// "//evil.com" 같은 외부 주소로 보내는 오픈 리다이렉트 공격을 막기 위함입니다.
export function safeRedirectPath(next: unknown, fallback = "/") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
