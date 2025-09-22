/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  transpilePackages: ['next-themes', 'sonner'],
  // Disable strict mode temporarily to avoid double mounting issues
  reactStrictMode: false,

 eslint: {
    ignoreDuringBuilds: true, // <-- add this
  },
}

module.exports = nextConfig