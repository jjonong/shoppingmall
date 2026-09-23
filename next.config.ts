import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image는 허용한 외부 도메인의 이미지만 표시합니다.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
