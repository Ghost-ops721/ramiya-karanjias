import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep firebase-admin outside the Turbopack bundle so jose/jwks-rsa
  // resolve correctly on Vercel Node serverless (dynamic admin routes).
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;
