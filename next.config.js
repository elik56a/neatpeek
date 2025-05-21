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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://www.figma.com https://*.figma.com https://www.google-analytics.com https://www.googletagmanager.com https://figma-alpha-api.s3.us-west-2.amazonaws.com https://lh3.googleusercontent.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.figma.com https://www.figma.com https://*.figma.com https://api.openai.com https://vitals.vercel-insights.com https://www.google-analytics.com; frame-src 'self' https://www.figma.com https://*.figma.com; object-src 'none'",
          },
        ],
      },
    ];
  },
  // Configure domain/subdomain routing
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    const isDevelopment = process.env.NODE_ENV === "development";

    // In development, handle Railway subdomain
    if (isDevelopment) {
      return {
        beforeFiles: [
          {
            source: "/:path*",
            has: [
              {
                type: "host",
                value: "app.dev-neatpeek.up.railway.app",
              },
            ],
            destination: "/:path*",
          },
        ],
      };
    }

    // In production, we'll use Railway's domain routing
    if (isProduction) {
      return {
        beforeFiles: [
          {
            source: "/:path*",
            has: [
              {
                type: "host",
                value: "app.neatpeek.up.railway.app",
              },
            ],
            destination: "/:path*",
          },
        ],
      };
    }

    // For local development
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "app.localhost:4455",
            },
          ],
          destination: "/:path*",
        },
      ],
    };
  },
  webpack: config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      http2: false,
      path: false,
      os: false,
      stream: false,
      https: false,
      http: false,
      zlib: false,
      querystring: false,
      crypto: false,
      url: false,
      util: false,
      bcrypt: false,
      "@mapbox/node-pre-gyp": false,
      "node:events": false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname, "src"),
    };
    return config;
  },
};

module.exports = nextConfig;
