// 샘플 데이터를 넣는 스크립트: `npx prisma db seed`
// 여러 번 실행해도 같은 데이터가 중복 생성되지 않도록 upsert를 사용합니다.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const categories = [
  { name: "상의", slug: "top" },
  { name: "하의", slug: "bottom" },
  { name: "신발", slug: "shoes" },
  { name: "액세서리", slug: "accessory" },
];

// 이미지는 무료 placeholder 서비스(picsum.photos)를 사용합니다. seed 값이 같으면 항상 같은 이미지가 나옵니다.
const products = [
  { name: "베이직 코튼 티셔츠", price: 19000, stock: 50, category: "top", description: "매일 입기 좋은 부드러운 면 100% 티셔츠입니다." },
  { name: "오버핏 후드티", price: 45000, stock: 30, category: "top", description: "넉넉한 핏의 기모 후드티로 쌀쌀한 날씨에 딱이에요." },
  { name: "스트라이프 셔츠", price: 39000, stock: 20, category: "top", description: "깔끔한 스트라이프 패턴의 데일리 셔츠입니다." },
  { name: "와이드 데님 팬츠", price: 52000, stock: 25, category: "bottom", description: "편안한 와이드 핏 청바지입니다." },
  { name: "코튼 치노 팬츠", price: 42000, stock: 40, category: "bottom", description: "어디에나 잘 어울리는 기본 치노 팬츠입니다." },
  { name: "트레이닝 조거 팬츠", price: 35000, stock: 0, category: "bottom", description: "신축성 좋은 조거 팬츠입니다. (품절 예시 상품)" },
  { name: "캔버스 스니커즈", price: 59000, stock: 15, category: "shoes", description: "가볍고 튼튼한 캔버스 스니커즈입니다." },
  { name: "러닝화", price: 89000, stock: 10, category: "shoes", description: "쿠션감이 좋은 데일리 러닝화입니다." },
  { name: "가죽 카드지갑", price: 29000, stock: 35, category: "accessory", description: "슬림한 소가죽 카드지갑입니다." },
  { name: "울 비니", price: 22000, stock: 45, category: "accessory", description: "따뜻한 울 혼방 비니입니다." },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // 상품은 이미 있으면 건너뜁니다 (이름 기준).
  for (const [i, p] of products.entries()) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: `https://picsum.photos/seed/product${i + 1}/600/600`,
        category: { connect: { slug: p.category } },
      },
    });
  }

  // 테스트 계정 (실제 서비스에서는 절대 이런 비밀번호를 쓰지 마세요)
  const users = [
    { email: "admin@shop.com", name: "관리자", role: "ADMIN" as const, password: "admin1234" },
    { email: "user@shop.com", name: "테스트유저", role: "USER" as const, password: "user1234" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, role: u.role, passwordHash: await bcrypt.hash(u.password, 10) },
    });
  }

  console.log("샘플 데이터 준비 완료:", {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    users: await prisma.user.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
