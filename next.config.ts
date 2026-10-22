import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // www.tathagat.xyz → tathagat.xyz, permanently
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tathagat.xyz" }],
        destination: "https://tathagat.xyz/:path*",
        permanent: true,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
