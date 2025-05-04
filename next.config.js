/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DEBUG_HIDE_PRISMA_LOGS: "true",
  },
  // Disable ESLint during production builds
  eslint: {
    // Only run ESLint on local development
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    // Only run type checking on local development
    ignoreBuildErrors: true,
  },
  // Domain configuration for app and marketing
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
  // Configure domain/subdomain routing
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";

    // In production, we'll use Netlify redirects for routing between app.domain.com and domain.com
    if (isProduction) {
      return [];
    }

    // In development, we use rewrites to simulate the subdomain routing
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "app.localhost:4456",
            },
          ],
          destination: "/app/:path*",
        },
      ],
    };
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
