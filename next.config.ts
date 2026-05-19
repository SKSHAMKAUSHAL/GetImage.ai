import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
      {
        protocol: 'https',
        hostname: 'gen.pollinations.ai',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
