import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent webpack/turbopack from bundling these packages.
  // pdf-parse v1.x reads ./test/data/05-versions-space.pdf at module evaluation
  // time when bundled, which fails on Vercel (read-only FS, no test files).
  // Marking them external keeps them as real node_modules requires at runtime.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
