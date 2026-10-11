import type { Metadata } from "next";
import GuestCheckIn from "@/components/door/GuestCheckIn";
import { doorTokenFrom, isSessionId } from "@/lib/door-check-in";

// The door QR opens this page with a fresh token each time: never cache it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Etkinlik Girişi | SKY LAB",
  description: "Kapıdaki QR kodla SKY LAB etkinliğine girişinizi yapın.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// CORE_API_ORIGIN is API_BASE_URL, written into the build by next.config.ts.
const coreApi = (process.env.CORE_API_ORIGIN ?? "").replace(/\/+$/, "");

type SessionLookup = { kind: "found"; title: string | null } | { kind: "missing" } | { kind: "unknown" };

// The Session's title, shown so the guest sees they are at the right door.
// Core's GET /v1/sessions/{id} is public. A 404 means the QR names no Session
// (core would refuse the check-in too); any other failure leaves the form up.
async function findSession(sessionId: string): Promise<SessionLookup> {
  if (!coreApi) return { kind: "unknown" };
  try {
    const response = await fetch(`${coreApi}/v1/sessions/${sessionId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (response.status === 404) return { kind: "missing" };
    if (!response.ok) return { kind: "unknown" };
    const session = (await response.json()) as { title?: unknown };
    const title = typeof session.title === "string" ? session.title.trim() : "";
    return { kind: "found", title: title || null };
  } catch {
    return { kind: "unknown" };
  }
}

export default async function DoorCheckInPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ dq?: string | string[] }>;
}) {
  const { sessionId } = await params;
  const { dq } = await searchParams;
  const validSession = isSessionId(sessionId);
  const doorToken = validSession ? doorTokenFrom(dq) : null;
  const session = validSession && doorToken ? await findSession(sessionId) : null;
  const title = session?.kind === "found" ? session.title : null;
  const missing = session?.kind === "missing";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-10 pb-12 sm:justify-center sm:pt-6">
      <p className="text-2xs font-medium tracking-label text-subtle-foreground uppercase">Etkinlik girişi</p>
      <h1 className="mt-2 text-2xl leading-tight font-semibold text-balance text-foreground-strong">
        {title ?? "Kapıda giriş"}
      </h1>
      <GuestCheckIn sessionId={sessionId} doorToken={doorToken} sessionMissing={missing} />
    </div>
  );
}
