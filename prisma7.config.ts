import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // 마이그레이션(테이블 생성/변경)은 커넥션 풀러를 거치지 않는 직접 연결 주소를 사용합니다.
    // Neon/Vercel이 만들어주는 DATABASE_URL_UNPOOLED가 없으면 DATABASE_URL을 사용합니다.
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
