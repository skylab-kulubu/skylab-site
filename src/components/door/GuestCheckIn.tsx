"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
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
import {
  EMAIL_MEMORY_DAYS,
  EMAIL_MEMORY_KEY,
  forgetEmail,
  pruneRememberedEmail,
  readRememberedEmail,
  rememberEmail,
  remembersEmail,
  type EmailStorage,
} from "@/lib/door-email-memory";
import { suggestEmailFix } from "@/lib/email-typo";

// `email` is the address this answer is about, or null before any was sent.
type Result = { outcome: CheckInOutcome; retryAfter: number | null; email: string | null };

const apiBase = coreApiBase(process.env.NODE_ENV, process.env.CORE_API_ORIGIN);

// The e-mail this device last checked in with, kept in localStorage (see
// door-email-memory.ts). The server and the first client render see none, so
// hydration matches; the saved one shows right after.
const emailListeners = new Set<() => void>();

function deviceStorage(): EmailStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function subscribeToEmail(onChange: () => void): () => void {
  emailListeners.add(onChange);
  pruneRememberedEmail(deviceStorage(), Date.now());
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === EMAIL_MEMORY_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    emailListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const rememberedEmailNow = () => readRememberedEmail(deviceStorage(), Date.now());
const noEmailOnServer = () => null;
const emailChanged = () => emailListeners.forEach((listener) => listener());

// Sends the guest's e-mail and the door token to core once per check-in. After
// a check-in core took, the e-mail is remembered on this device only, so the
// next scan offers it as one tap; it is never logged or sent anywhere else.
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
  const remembered = useSyncExternalStore(subscribeToEmail, rememberedEmailNow, noEmailOnServer);
  // The guest chose to type another address than the remembered one.
  const [typing, setTyping] = useState(false);
  // The guest came back from the form to the remembered address.
  const [returned, setReturned] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(() => {
    if (!doorToken) return { outcome: "scan-required", retryAfter: null, email: null };
    if (sessionMissing) return { outcome: "qr-invalid", retryAfter: null, email: null };
    return null;
  });
  const resultRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void checkIn(email);
  }

  async function checkIn(address: string) {
    if (locked || !doorToken) return;
    setSending(true);
    let next: Result;
    try {
      const response = await fetch(guestCheckInUrl(apiBase, sessionId), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/problem+json, application/json" },
        body: JSON.stringify({ email: address.trim(), doorToken }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      const problem = response.ok ? null : await response.json().catch(() => null);
      const code = typeof problem?.code === "string" ? problem.code : null;
      const reason = typeof problem?.reason === "string" ? problem.reason : null;
      next = {
        outcome: outcomeFor(response.status, code, reason),
        retryAfter: retryAfterSeconds(response.headers.get("Retry-After")),
        email: address.trim(),
      };
    } catch {
      next = { outcome: "network", retryAfter: null, email: address.trim() };
    }
    // Only a check-in core took saves the address. Any other answer, "no ticket"
    // included, leaves the remembered one alone: the guest picks another below.
    if (remembersEmail(next.outcome)) {
      rememberEmail(deviceStorage(), address, Date.now());
      emailChanged();
    }
    setResult(next);
    setSending(false);
  }

  function typeAnother() {
    setResult(null);
    setReturned(false);
    setTyping(true);
  }

  function backToRemembered() {
    setResult(null);
    setTyping(false);
    setReturned(true);
  }

  // The guest took the suggested spelling: it goes into the field, and they
  // send it themselves.
  function takeSuggestion(address: string) {
    setEmail(address);
    setResult(null);
    setReturned(false);
    setTyping(true);
    // The hint goes away with the answer; keep the focus on the field it fixed.
    setTimeout(() => emailRef.current?.focus(), 0);
  }

  function forget() {
    forgetEmail(deviceStorage());
    emailChanged();
    setResult(null);
    setTyping(true);
  }

  const message = result ? messageFor(result.outcome, result.retryAfter, result.email) : null;
  const suggestion = result?.outcome === "no-ticket" && result.email ? suggestEmailFix(result.email) : null;
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

  const notice =
    result && message && view ? (
      <Notice
        ref={resultRef}
        tabIndex={-1}
        tone={view.tone}
        title={message.title}
        role={message.tone === "error" ? "alert" : "status"}
        className="enter-rise pr-3 outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        action={
          suggestion ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto min-h-7 text-left whitespace-normal [overflow-wrap:anywhere]"
              onClick={() => takeSuggestion(suggestion)}
            >
              {suggestion} mu demek istediniz?
            </Button>
          ) : null
        }
      >
        <span className="[overflow-wrap:anywhere]">{message.detail}</span>
      </Notice>
    ) : null;

  // This device checked in before: offer that address as one tap.
  if (remembered && !typing) {
    return (
      <>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
          Bu e-postayla mı katılıyorsunuz?
        </p>
        <Card className="mt-8 gap-4 p-5">
          {notice}
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="h-auto min-h-11 w-full py-2.5 whitespace-normal"
            disabled={locked}
            pending={sending}
            autoFocus={returned}
            onClick={() => void checkIn(remembered)}
          >
            <span className="min-w-0 text-center [overflow-wrap:anywhere]">
              {sending ? "Gönderiliyor…" : `${remembered} ile katıl`}
            </span>
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Button type="button" variant="link" size="md" disabled={sending} onClick={typeAnother}>
              Başka e-posta
            </Button>
            <Button type="button" variant="ghost" size="xs" disabled={sending} onClick={forget}>
              Bu cihazda unut
            </Button>
          </div>
        </Card>
      </>
    );
  }

  // The form is up: say what to type, then ask for it.
  return (
    <>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
        Etkinliğe kayıt olurken kullandığınız e-posta adresini yazın; girişiniz bu oturuma kaydedilsin.
      </p>
      <Card className="mt-8 gap-5 p-5">
        {notice}

        <form onSubmit={submit} className="flex flex-col gap-4" aria-busy={sending}>
          <Field
            label="E-posta adresiniz"
            description={`Yalnızca girişinizi kaydetmek için kullanılır. Giriş alınınca bu cihazda ${EMAIL_MEMORY_DAYS} gün hatırlanır.`}
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
              ref={emailRef}
              autoFocus={typing}
              aria-invalid={view?.blamesEmail || undefined}
              placeholder="ornek@eposta.com"
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={locked} pending={sending}>
            {sending ? "Gönderiliyor…" : "Girişimi yap"}
          </Button>
          {remembered ? (
            <Button type="button" variant="link" size="md" className="self-start" disabled={sending} onClick={backToRemembered}>
              Vazgeç
            </Button>
          ) : null}
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
