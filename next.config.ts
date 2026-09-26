import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Allows images from all paths under this hostname
      },
      {
        protocol: 'https',
        port: '',
        hostname: 'example.com',
        pathname: '/logos/**',
      },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "example.com" },
    ],
  },
};

export default nextConfig;