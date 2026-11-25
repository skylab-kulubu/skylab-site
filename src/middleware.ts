import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { certificatePdfRewrite } from "@/lib/certificate-pdf";
import { isSandbox } from "@/lib/search-index";

export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  // /sertifika/{serial}.pdf is served by /sertifika/{serial}/pdf (src/lib/certificate-pdf.ts).
  const pdf = certificatePdfRewrite(req.nextUrl.pathname);
  const response = pdf
    ? NextResponse.rewrite(new URL(pdf, req.url), { request: { headers } })
    : NextResponse.next({ request: { headers } });
  // Nothing from the sandbox, images included, may reach a search index.
  if (isSandbox()) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
