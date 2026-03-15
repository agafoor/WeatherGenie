import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mammoth uses native Node.js modules; keeping it external prevents
  // Turbopack from bundling it and avoids runtime compatibility issues.
  serverExternalPackages: ["mammoth"],
};

export default nextConfig;
