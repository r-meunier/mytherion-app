import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/projects/:projectId/entities',
        destination: '/projects/:projectId/codex',
        permanent: true,
      },
      {
        source: '/projects/:projectId/entities/:path*',
        destination: '/projects/:projectId/codex/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
