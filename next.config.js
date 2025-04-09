/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    DEBUG_HIDE_PRISMA_LOGS: 'true',
  },
}

module.exports = nextConfig
