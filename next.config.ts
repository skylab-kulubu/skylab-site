import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

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

// Local development only (`next dev`). The club's edge does not let a page on
// http://localhost:3000 call its hosts cross-origin, so the CMS editor in the browser calls
// this dev server on its own origin and the server forwards /sandbox-api/* to the sandbox API,
// never to production. Locally CMS_URL=http://localhost:3000/sandbox-api/api (README).
// `next build` never adds this rewrite, so the image forwards nothing.
const sandboxApi = {
  source: "/sandbox-api/:path*",
  destination: "https://sandbox-api.yildizskylab.com/:path*",
};

export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  const cms = process.env.CMS_URL ?? "";
  if (/^https:\/\/([\w-]+\.)*yildizskylab\.com(\/|$)/.test(cms)) {
    console.warn(
      `⚠ CMS_URL=${cms}: the editor's browser would call that host from http://localhost:3000, which the edge does not allow. Use http://localhost:3000/sandbox-api/api (README).`,
    );
  } else if (cms.startsWith("http://localhost") && !process.env.API_BASE_URL) {
    console.warn(
      "⚠ API_BASE_URL is not set: CMS image uploads would go to this dev server instead of core. Set API_BASE_URL=https://sandbox-api.yildizskylab.com (README).",
    );
  }
  return { ...nextConfig, rewrites: async () => [sandboxApi] };
}
