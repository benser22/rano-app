import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  images: {
    // Disable optimization to avoid private IP blocking in Docker
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // For local Docker development
      {
        protocol: "http",
        hostname: "localhost",
        port: "4001",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      // For Docker internal communication
      {
        protocol: "http",
        hostname: "strapi",
        port: "1337",
      },
      // Allow images from the configured API URL
      ...getRemotePatternFromUrl(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337",
      ),
    ],
  },
};

function getRemotePatternFromUrl(url: string) {
  try {
    const { protocol, hostname, port, pathname } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: `${pathname === "/" ? "" : pathname}/**`, // Allow all paths under the API URL
      },
    ];
  } catch {
    return [];
  }
}

export default nextConfig;
