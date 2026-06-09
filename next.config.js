/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to keep these packages server-side only (not bundled for client)
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent mongoose/bcryptjs from being bundled on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
