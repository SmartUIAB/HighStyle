/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  sassOptions: { implementation: "sass-embedded" },
  async rewrites() {
    const value = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_KEY;
    if (!value) return [];
    const origin = new URL(value);
    if (origin.origin !== value || !["https:", "http:"].includes(origin.protocol) || origin.username || origin.password) throw new Error("API_ORIGIN must be an HTTP(S) origin");
    return [
      { source: "/api/graphql", destination: `${origin.origin}/graphql` },
      { source: "/api/release", destination: `${origin.origin}/health/release` },
      { source: "/uploads/:path*", destination: `${origin.origin}/uploads/:path*` },
    ];
  },
};

module.exports = nextConfig;
