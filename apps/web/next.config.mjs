/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/ai",
    "@repo/memory",
    "@repo/orchestrator",
    "@repo/schemas",
    "@repo/shared",
    "@repo/workers",
  ],
};

export default nextConfig;
