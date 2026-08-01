import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages cannot run the app server, so its workflow exports a static build.
  output: process.env.GITHUB_ACTIONS ? "export" : undefined,
};

export default nextConfig;
