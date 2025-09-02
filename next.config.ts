import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for critical errors
    } : false
  }
};

export default nextConfig;
