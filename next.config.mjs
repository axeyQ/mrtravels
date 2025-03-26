/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
};

// ES Module syntax
export default nextConfig;