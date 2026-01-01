import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['leaflet', 'react-leaflet'],
  output: 'standalone', // Enable standalone output for Docker
};

export default nextConfig;
