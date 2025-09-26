import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Add 'ik.imagekit.io' to the list of allowed domains
    domains: ['ik.imagekit.io'],
  },
};

export default nextConfig;
