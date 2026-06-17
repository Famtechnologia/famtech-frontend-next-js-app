import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.imagekit.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.mapbox.com', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
