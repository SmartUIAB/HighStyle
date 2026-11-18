//  @type {import('next').NextConfig}
const nextConfig = {
  poweredByHeader: false,
  sassOptions: { implementation: "sass-embedded" },
  rewrites: async () => {
    const value = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_URL;
    if (!value) return [];
    const origin = new URL(value);
    if (origin.origin !== value || !["https:", "http:"].includes(origin.protocol) || origin.username || origin.password) throw new Error("API_ORIGIN must be an HTTP(S) origin");
    return [
      { source: "/api/graphql", destination: `${origin.origin}/graphql` },
      { source: "/api/release", destination: `${origin.origin}/health/release` },
      { source: "/uploads/:path*", destination: `${origin.origin}/uploads/:path*` },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
