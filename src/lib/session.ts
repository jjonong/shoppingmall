import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

// 로그인 상태는 서명된 JWT를 httpOnly 쿠키에 담아 유지합니다 (stateless session).
// 서명 덕분에 사용자가 쿠키 내용을 조작하면 검증에 실패합니다.

export type SessionPayload = {
  userId: number;
  role: "USER" | "ADMIN";
};

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7일

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 환경변수가 없습니다. .env 파일을 확인하세요.");
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getKey());
}

// 쿠키가 없거나, 만료되었거나, 위조된 경우 null을 반환합니다.
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number" || (payload.role !== "USER" && payload.role !== "ADMIN")) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // 브라우저 JS에서 읽을 수 없음 (XSS로 탈취 방지)
    secure: process.env.NODE_ENV === "production", // 배포 환경에서는 https로만 전송
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function readSessionCookie() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME as SESSION_COOKIE_NAME };
