import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "rano-api.22studios.xyz",
      },
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
      {
        protocol: "http",
        hostname: "strapi",
        port: "1337",
      },
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
