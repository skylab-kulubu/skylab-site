import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSandbox } from "@/lib/search-index";

export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers } });
  // Nothing from the sandbox, images included, may reach a search index.
  if (isSandbox()) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
