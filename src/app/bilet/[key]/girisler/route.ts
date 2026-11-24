import { findCheckIns, visitorAddress } from "@/lib/ticket-page";

// The ticket page's own check-ins, asked by the page in the browser while it
// is open at the door (src/lib/ticket-check-ins.ts). This server asks core,
// as the page itself does, so the browser never calls core for it and core
// counts each visitor by the address passed along.
export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

const STATUS = { stop: 404, limited: 429, failed: 503 } as const;

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const visitor = visitorAddress(request.headers.get("x-forwarded-for"), request.headers.get("x-real-ip"));
  const result = await findCheckIns(key, process.env.CORE_API_ORIGIN, {
    visitor,
    coreInternalUrl: process.env.CORE_INTERNAL_URL,
  });
  if (result.kind === "ok") return Response.json({ checkIns: result.checkIns }, { headers: HEADERS });
  return new Response(null, { status: STATUS[result.kind], headers: HEADERS });
}
