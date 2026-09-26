import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Core's API host for the CMS image bridge (src/app/api/cms-media). The
  // image build sets API_BASE_URL per environment; the running site has no
  // API_BASE_URL of its own, so the value is fixed at build time.
  env: { CORE_API_ORIGIN: process.env.API_BASE_URL ?? "" },
  reactCompiler: true,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/img/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const orig = config.watchOptions?.ignored;
      let newIgnored;

      if (orig instanceof RegExp) {
        newIgnored = new RegExp(orig.source + "|cms-blocks\\.json");
      } else if (typeof orig === "string") {
        newIgnored = [orig, "**/cms-blocks.json"];
      } else if (Array.isArray(orig)) {
        newIgnored = [
          ...orig.filter((x) => typeof x === "string"),
          "**/cms-blocks.json",
        ];
      } else {
        newIgnored = "**/cms-blocks.json";
      }

      config.watchOptions = {
        ...config.watchOptions,
        ignored: newIgnored,
      };
    }
    return config;
  },
};

export default nextConfig;
