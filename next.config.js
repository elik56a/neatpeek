/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DEBUG_HIDE_PRISMA_LOGS: 'true',
  },
  // Domain configuration for app and marketing
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  // Configure domain/subdomain routing
  async rewrites() {
    return {
      beforeFiles: [
        // When in development, we want to route all requests to the same Next.js app
        // In production, these would be handled by DNS configuration
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'app.localhost:4456',
            },
          ],
          destination: '/app/:path*',
        },
      ],
    };
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. on the client
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
        '@mapbox/node-pre-gyp': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
