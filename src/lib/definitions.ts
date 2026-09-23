import * as z from "zod";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/image-hosts";

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

// 폼의 문자열 값을 정수로 변환합니다. 빈 칸은 0이 아니라 "입력해주세요" 에러가 되도록 합니다.
function requiredInt(emptyMessage: string) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : undefined),
    z.number({ error: emptyMessage }).int({ error: "정수로 입력해주세요." }),
  );
}

// 관리자 상품 등록/수정 폼
export const ProductSchema = z.object({
  name: z.string().trim().min(1, { error: "상품명을 입력해주세요." }).max(100, { error: "상품명은 100자 이하로 입력해주세요." }),
  description: z.string().trim().min(1, { error: "상품 설명을 입력해주세요." }).max(2000, { error: "설명은 2000자 이하로 입력해주세요." }),
  price: requiredInt("가격을 숫자로 입력해주세요.").pipe(
    z.number().min(0, { error: "0원 이상이어야 합니다." }).max(100_000_000, { error: "가격이 너무 큽니다." }),
  ),
  stock: requiredInt("재고를 숫자로 입력해주세요.").pipe(
    z.number().min(0, { error: "0개 이상이어야 합니다." }).max(100_000, { error: "재고가 너무 많습니다." }),
  ),
  imageUrl: z
    .url({ protocol: /^https$/, error: "https:// 로 시작하는 이미지 주소를 입력해주세요." })
    .refine((u) => ALLOWED_IMAGE_HOSTS.includes(new URL(u).hostname), {
      error: `허용된 이미지 사이트만 사용할 수 있습니다: ${ALLOWED_IMAGE_HOSTS.join(", ")}`,
    }),
  categoryId: requiredInt("카테고리를 선택해주세요.").pipe(z.number().positive({ error: "카테고리를 선택해주세요." })),
  isActive: z.preprocess((v) => v === "on", z.boolean()), // 체크박스는 체크하면 "on", 아니면 값이 없음
});

export type ProductFormValues = { [K in keyof z.infer<typeof ProductSchema>]?: string };

export type ProductFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof ProductSchema>, string[]>>;
      message?: string;
      values?: ProductFormValues;
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
