import type { Metadata } from "next";

// The sandbox deployment answers on a host starting with sandbox (sandbox-artlab.…,
// sandbox.…) and must stay out of search results. NEXTAUTH_URL is set per environment
// at runtime, so it tells the two apart.
export function isSandbox() {
  return /:\/\/sandbox[.-]/.test(process.env.NEXTAUTH_URL ?? "");
}

// Pages are indexed on the live site, the photos on them are not.
export function robotsFor(): Metadata["robots"] {
  const index = !isSandbox();
  return { index, follow: index, googleBot: { index, follow: index, noimageindex: true } };
}
