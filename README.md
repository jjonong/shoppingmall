# 바이브샵

Next.js로 만든 학습/포트폴리오용 쇼핑몰입니다. 실제 결제는 하지 않고, 주문하면 바로 '결제완료' 상태가 됩니다.

## 기능

- **상품**: 카테고리 필터, 검색, 가격순 정렬, 상세 페이지
- **회원**: 회원가입, 로그인, 로그아웃, 마이페이지
- **장바구니/주문**: 수량 변경, 재고 확인, 주문(재고 차감), 주문 내역, 주문 취소(재고 복구)
- **관리자**: 대시보드(매출, 처리할 주문, 재고 부족), 상품 등록/수정/판매중지, 주문 상태 변경

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| 스타일 | Tailwind CSS 4 |
| DB | PostgreSQL (Neon) + Prisma 7 |
| 인증 | 직접 구현: bcrypt 비밀번호 해시, jose로 서명한 JWT를 httpOnly 쿠키에 저장 |
| 검증 | Zod |
| 배포 | Vercel |

## 폴더 구조

```
src/
  app/            페이지 (폴더 = 주소)
    actions/      Server Actions (데이터 변경: 로그인, 장바구니, 주문, 관리자)
    admin/        관리자 페이지
  components/     화면 조각 (헤더, 상품 카드, 폼 등)
  lib/            공용 코드 (DB 연결, 세션, 권한 확인, 입력값 검증)
  proxy.ts        페이지 접근 전 로그인 여부 1차 확인
prisma/
  schema.prisma   DB 테이블 구조
  seed.ts         샘플 데이터
```

## 로컬에서 실행하기

1. Node.js 20 이상을 설치합니다.
2. 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. `.env.example`을 복사해 `.env`를 만들고 값을 채웁니다. DB는 [Neon](https://neon.tech)에서 무료로 만들 수 있습니다.
4. 테이블을 만들고 샘플 데이터를 넣습니다.
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
5. 개발 서버를 실행하고 http://localhost:3000 에 접속합니다.
   ```bash
   npm run dev
   ```

### 테스트 계정 (샘플 데이터)

| 구분 | 이메일 | 비밀번호 |
|---|---|---|
| 관리자 | admin@shop.com | admin1234 |
| 일반회원 | user@shop.com | user1234 |

### 자주 쓰는 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run db:studio` | 브라우저에서 DB 내용 보기/수정 |
| `npm run db:seed` | 샘플 데이터 넣기 (여러 번 실행해도 중복되지 않음) |
| `npx prisma migrate dev --name 설명` | `schema.prisma` 변경 후 DB에 반영 |

## 배포 (Vercel)

1. Vercel에서 이 GitHub 저장소를 가져옵니다(Import).
2. 프로젝트의 **Storage** 탭에서 Neon Postgres를 연결하면 `DATABASE_URL`, `DATABASE_URL_UNPOOLED`가 자동으로 설정됩니다.
3. **Settings → Environment Variables**에 `SESSION_SECRET`을 추가합니다.
4. 다시 배포(Redeploy)합니다. 배포할 때 `vercel-build` 스크립트가 DB 마이그레이션을 자동으로 실행합니다.
5. 처음 한 번은 로컬에서 같은 DB 주소로 `npm run db:seed`를 실행해 샘플 데이터를 넣습니다.
