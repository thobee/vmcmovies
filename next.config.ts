import type { NextConfig } from "next";
import { ADMIN_SECURITY_HEADERS, HSTS, SECURITY_HEADERS } from "@/lib/security/headers";

const nextConfig: NextConfig = {
  // Phone/LAN access (http://192.168.x.x:3000) is blocked from /_next chunks without this.
  allowedDevOrigins: ["192.168.1.12", "192.168.1.2", "172.20.10.3", "192.168.1.8", "127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS, HSTS],
      },
      { source: "/admin", headers: ADMIN_SECURITY_HEADERS },
      { source: "/admin/:path*", headers: ADMIN_SECURITY_HEADERS },
      { source: "/api/admin/:path*", headers: ADMIN_SECURITY_HEADERS },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "*.tmdb.org" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "*.hf.space" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
