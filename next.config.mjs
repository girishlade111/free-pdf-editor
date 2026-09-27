/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/free-pdf-editor',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
