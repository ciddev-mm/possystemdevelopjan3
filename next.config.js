/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Google Fonts optimization to prevent build hanging when offline
  optimizeFonts: false,
  // Disable ESLint and TypeScript type checking during build to save RAM
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source map generation to further reduce memory footprint
  productionBrowserSourceMaps: false,
  // Limit build workers to a single thread to prevent memory exhaustion
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
}

module.exports = nextConfig



