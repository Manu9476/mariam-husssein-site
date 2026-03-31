import type { NextConfig } from "next";

const fallbackUrl = "https://example.com";
const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL ?? fallbackUrl;

let mediaProtocol: "http" | "https" = "https";
let mediaHostname = "example.com";

try {
  const parsed = new URL(wordpressUrl);
  mediaProtocol = parsed.protocol.replace(":", "") as "http" | "https";
  mediaHostname = parsed.hostname;
} catch {
  mediaProtocol = "https";
  mediaHostname = "example.com";
}

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  transpilePackages: ["next-sanity", "sanity"],
  images: {
    remotePatterns: [
      {
        protocol: mediaProtocol,
        hostname: mediaHostname,
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
