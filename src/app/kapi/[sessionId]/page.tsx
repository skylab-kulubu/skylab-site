import type { Metadata } from "next";
import { DoorOpen } from "lucide-react";
import Header from "@/components/layouts/Header";
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
    <div className="relative min-h-svh overflow-hidden bg-[#04030e] text-white">
      <Header />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.24),transparent_68%)]" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-svh items-start justify-center px-4 pb-14 pt-28 sm:items-center sm:px-6 sm:pt-32">
        <section className="glass-panel-dark relative w-full max-w-lg overflow-hidden rounded-[2rem] px-5 py-8 sm:px-10 sm:py-11">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200">
            <DoorOpen aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.28em] text-indigo-300">ETKİNLİK GİRİŞİ</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">
            {title ?? "Kapıda giriş"}
          </h1>
          {doorToken && !missing ? (
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Etkinliğe kayıt olurken kullandığınız e-posta adresini yazın; girişiniz bu oturuma
              kaydedilsin.
            </p>
          ) : null}
          <div className="mt-8">
            <GuestCheckIn sessionId={sessionId} doorToken={doorToken} sessionMissing={missing} />
          </div>
        </section>
      </div>
    </div>
  );
}
