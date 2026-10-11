import type { MetadataRoute } from "next";
import { isSandbox } from "@/lib/search-index";

// Answered per request, since the same image runs as the sandbox and as the live site.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (isSandbox()) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" } };
}
