import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable optimization in development to avoid "private IP" blocking
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Allow images from the configured API URL
      ...getRemotePatternFromUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'),
    ],
  },
};

function getRemotePatternFromUrl(url: string) {
  try {
    const { protocol, hostname, port, pathname } = new URL(url);
    return [{
      protocol: protocol.replace(':', '') as 'http' | 'https',
      hostname,
      port,
      pathname: `${pathname === '/' ? '' : pathname}/**`, // Allow all paths under the API URL
    }];
  } catch {
    return [];
  }
}

export default nextConfig;
