import { requestCancel, visitorAddress } from "@/lib/ticket-page";

// The holder cancels the ticket from its page (src/lib/ticket-cancel.ts). This
// server asks core, as the page itself does, so the browser never calls core
// and core counts each visitor by the address passed along. The answer carries
// core's refusal code only: nothing of the person.
export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

const STATUS = { cancelled: 200, refused: 409, "not-found": 404, limited: 429, failed: 503 } as const;

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const visitor = visitorAddress(request.headers.get("x-forwarded-for"), request.headers.get("x-real-ip"));
  const outcome = await requestCancel(key, process.env.CORE_API_ORIGIN, {
    visitor,
    coreInternalUrl: process.env.CORE_INTERNAL_URL,
  });
  return Response.json(outcome.kind === "refused" ? { code: outcome.code } : {}, {
    status: STATUS[outcome.kind],
    headers: HEADERS,
  });
}
