import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy backend static files (community/post/profile images) so they load same-origin
      { source: "/public/:path*", destination: `${apiBase}/public/:path*` },
    ];
  },
};

export default nextConfig;