import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Legacy alias: /entities was renamed to /codex (MYT-81). Kept as a permanent
  // server-side redirect so old links resolve; it is a URL, not a domain term.
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
