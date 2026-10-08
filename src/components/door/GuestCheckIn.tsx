"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Info, LoaderCircle, Mail, ScanQrCode } from "lucide-react";
import {
  coreApiBase,
  guestCheckInUrl,
  isFinal,
  messageFor,
  needsNewScan,
  outcomeFor,
  retryAfterSeconds,
  type CheckInOutcome,
} from "@/lib/door-check-in";

type Result = { outcome: CheckInOutcome; retryAfter: number | null };

const apiBase = coreApiBase(process.env.NODE_ENV, process.env.CORE_API_ORIGIN);

// Sends the guest's e-mail and the door token to core once per submit. The
// e-mail lives only in this component's state: nothing is stored, logged or
// sent anywhere else.
export default function GuestCheckIn({
  sessionId,
  doorToken,
}: {
  sessionId: string;
  doorToken: string | null;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(
    doorToken ? null : { outcome: "scan-required", retryAfter: null },
  );
  const resultRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const helpId = useId();

  // The token is in the address bar; take it out of the browser history.
  // A reload then asks for a new scan, which the short-lived token needs anyway.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("dq")) return;
    url.searchParams.delete("dq");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (result && doorToken) resultRef.current?.focus();
  }, [result, doorToken]);

  const locked = sending || (result !== null && isFinal(result.outcome));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked || !doorToken) return;
    setSending(true);
    let next: Result;
    try {
      const response = await fetch(guestCheckInUrl(apiBase, sessionId), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/problem+json, application/json" },
        body: JSON.stringify({ email: email.trim(), doorToken }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      const problem = response.ok ? null : await response.json().catch(() => null);
      const code = typeof problem?.code === "string" ? problem.code : null;
      next = {
        outcome: outcomeFor(response.status, code),
        retryAfter: retryAfterSeconds(response.headers.get("Retry-After")),
      };
    } catch {
      next = { outcome: "network", retryAfter: null };
    }
    setResult(next);
    setSending(false);
  }

  const message = result ? messageFor(result.outcome, result.retryAfter) : null;
  const showForm = !(result && (needsNewScan(result.outcome) || result.outcome === "session-closed"));
  const done = result?.outcome === "checked-in" || result?.outcome === "already-checked-in";

  return (
    <div className="flex flex-col gap-6">
      {result && message ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          role={message.tone === "error" ? "alert" : "status"}
          className={`flex gap-3 rounded-2xl border px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            message.tone === "success"
              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
              : message.tone === "info"
                ? "border-indigo-300/20 bg-indigo-400/10 text-indigo-100"
                : "border-rose-300/20 bg-rose-400/10 text-rose-100"
          }`}
        >
          <OutcomeIcon outcome={result.outcome} tone={message.tone} />
          <div>
            <p className="text-base font-bold">{message.title}</p>
            <p className="mt-1 text-sm leading-6 opacity-85">{message.detail}</p>
          </div>
        </div>
      ) : null}

      {showForm && !done ? (
        <form onSubmit={submit} className="flex flex-col gap-4" aria-busy={sending}>
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-sm font-semibold text-slate-200">
              E-posta adresiniz
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              />
              <input
                id={inputId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={locked}
                aria-describedby={helpId}
                placeholder="ornek@eposta.com"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-12 pr-4 text-base text-white placeholder:text-slate-600 focus-visible:border-indigo-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60"
              />
            </div>
            <p id={helpId} className="text-xs leading-5 text-slate-500">
              Etkinliğe kayıt olurken kullandığınız adres. Yalnızca girişinizi kaydetmek için kullanılır.
            </p>
          </div>
          <button
            type="submit"
            disabled={locked}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#0b0920] transition hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            {sending ? "Gönderiliyor…" : "Girişimi yap"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function OutcomeIcon({ outcome, tone }: { outcome: CheckInOutcome; tone: "success" | "info" | "error" }) {
  const className = "mt-0.5 h-6 w-6 shrink-0";
  if (tone === "success") return <CircleCheck aria-hidden="true" className={className} />;
  if (tone === "info") return <Info aria-hidden="true" className={className} />;
  if (needsNewScan(outcome)) return <ScanQrCode aria-hidden="true" className={className} />;
  return <CircleAlert aria-hidden="true" className={className} />;
}
