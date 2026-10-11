"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Card, cn, Field, Input, Notice } from "@skylab-kulubu/skylcn-ui";
import { CircleAlert, CircleCheck, Clock, Info, Mail, ScanQrCode, WifiOff, type LucideIcon } from "lucide-react";
import {
  coreApiBase,
  guestCheckInUrl,
  isFinal,
  messageFor,
  outcomeFor,
  presentationFor,
  retryAfterSeconds,
  type CheckInOutcome,
  type OutcomePresentation,
} from "@/lib/door-check-in";

type Result = { outcome: CheckInOutcome; retryAfter: number | null };

const apiBase = coreApiBase(process.env.NODE_ENV, process.env.CORE_API_ORIGIN);

// Sends the guest's e-mail and the door token to core once per submit. The
// e-mail lives only in this component's state: nothing is stored, logged or
// sent anywhere else.
export default function GuestCheckIn({
  sessionId,
  doorToken,
  sessionMissing = false,
}: {
  sessionId: string;
  doorToken: string | null;
  sessionMissing?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(() => {
    if (!doorToken) return { outcome: "scan-required", retryAfter: null };
    if (sessionMissing) return { outcome: "qr-invalid", retryAfter: null };
    return null;
  });
  const resultRef = useRef<HTMLDivElement>(null);

  // The token is in the address bar; take it out of the browser history.
  // A reload then asks for a new scan, which the short-lived token needs anyway.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("dq")) return;
    url.searchParams.delete("dq");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (result && doorToken && !sessionMissing) resultRef.current?.focus();
  }, [result, doorToken, sessionMissing]);

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
  const view = result ? presentationFor(result.outcome) : null;

  // A final answer takes the form's place: there is nothing left to type.
  if (result && message && view?.replacesForm) {
    const Icon = ICONS[view.icon];
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role={message.tone === "error" ? "alert" : "status"}
        className={cn(
          "mt-8 flex enter-rise flex-col gap-4 rounded-xl border p-5 outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          TONES[view.tone].box,
        )}
      >
        <Icon aria-hidden="true" strokeWidth={1.75} className={cn("size-8 shrink-0", TONES[view.tone].icon)} />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg leading-snug font-semibold text-foreground-strong">{message.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{message.detail}</p>
        </div>
      </div>
    );
  }

  // The form is up: say what to type, then ask for it.
  return (
    <>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
        Etkinliğe kayıt olurken kullandığınız e-posta adresini yazın; girişiniz bu oturuma kaydedilsin.
      </p>
      <Card className="mt-8 gap-5 p-5">
        {result && message && view ? (
          <Notice
            ref={resultRef}
            tabIndex={-1}
            tone={view.tone}
            title={message.title}
            role={message.tone === "error" ? "alert" : "status"}
            className="enter-rise pr-3 outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {message.detail}
          </Notice>
        ) : null}

        <form onSubmit={submit} className="flex flex-col gap-4" aria-busy={sending}>
          <Field
            label="E-posta adresiniz"
            description="Yalnızca girişinizi kaydetmek için kullanılır; bu sayfa adresi saklamaz."
          >
            <Input
              icon={Mail}
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
              aria-invalid={view?.blamesEmail || undefined}
              placeholder="ornek@eposta.com"
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={locked} pending={sending}>
            {sending ? "Gönderiliyor…" : "Girişimi yap"}
          </Button>
        </form>
      </Card>
    </>
  );
}

const ICONS: Record<OutcomePresentation["icon"], LucideIcon> = {
  check: CircleCheck,
  info: Info,
  scan: ScanQrCode,
  wait: Clock,
  offline: WifiOff,
  alert: CircleAlert,
};

// The same washes skylcn-ui's Notice uses, for the answer that replaces the form.
const TONES: Record<OutcomePresentation["tone"], { box: string; icon: string }> = {
  success: { box: "border-success/30 bg-success/5", icon: "text-success" },
  info: { box: "border-info/30 bg-info/5", icon: "text-info" },
  warning: { box: "border-warning/30 bg-warning/5", icon: "text-warning" },
  danger: { box: "border-destructive/30 bg-destructive/5", icon: "text-destructive" },
};
