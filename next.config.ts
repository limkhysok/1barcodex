import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["172.18.112.1", "192.168.0.189", "x8wx38mg-3000.asse.devtunnels.ms"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  // rewrites removed in favor of src/middleware.ts unified proxy
};

export default nextConfig;
