// A guest's own check-in at the door (/kapi/[sessionId]).
//
// The door screen shows a QR that core signs and replaces every few seconds.
// It opens /kapi/<sessionId>?dq=<token>; the guest types the e-mail of their
// Ticket and the page posts it with the token to core:
// POST /v1/sessions/{sessionId}/check-in/guest {email, doorToken}.
// Core's docs/guest-self-check-in.md has the contract. The token is opaque:
// the page never reads, checks or trims it beyond the surrounding blanks.

const SESSION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSessionId(value: string): boolean {
  return SESSION_ID.test(value);
}

// The `dq` query value, or null when the page was opened without one.
export function doorTokenFrom(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const token = raw?.trim();
  return token ? token : null;
}

// Where the browser sends the check-in. The image build writes core's origin
// into CORE_API_ORIGIN (next.config.ts). `next dev` goes through its own
// /sandbox-api proxy instead, since the edge does not let http://localhost
// call the club's hosts cross-origin.
export function coreApiBase(nodeEnv: string | undefined, coreApiOrigin: string | undefined): string {
  if (nodeEnv === "development") return "/sandbox-api";
  return (coreApiOrigin ?? "").replace(/\/+$/, "");
}

export function guestCheckInUrl(apiBase: string, sessionId: string): string {
  return `${apiBase}/v1/sessions/${encodeURIComponent(sessionId)}/check-in/guest`;
}

export type CheckInOutcome =
  | "checked-in"
  | "already-checked-in"
  | "invalid-email"
  | "no-ticket"
  | "session-closed"
  | "scan-required"
  | "qr-invalid"
  | "qr-expired"
  | "qr-used-up"
  | "rate-limited"
  | "unavailable"
  | "network";

// Core answers errors as RFC 9457 problems; the branch is chosen by `code`,
// never by the title text.
export function outcomeFor(status: number, code?: string | null): CheckInOutcome {
  if (status === 201 || status === 200) return "checked-in";
  if (status === 409) return "already-checked-in";
  if (status === 400) return "invalid-email";
  if (status === 404) return "no-ticket";
  if (status === 429) return "rate-limited";
  if (status === 403) {
    switch (code) {
      case "session_closed":
        return "session-closed";
      case "door_qr_required":
        return "scan-required";
      case "door_qr_invalid":
        return "qr-invalid";
      case "door_qr_expired":
        return "qr-expired";
      case "door_qr_used_up":
        return "qr-used-up";
    }
  }
  return "unavailable";
}

// The QR the page was opened with can no longer check anybody in: the guest
// scans the door screen again.
export function needsNewScan(outcome: CheckInOutcome): boolean {
  return (
    outcome === "scan-required" ||
    outcome === "qr-invalid" ||
    outcome === "qr-expired" ||
    outcome === "qr-used-up"
  );
}

// Nothing more to do on this page: the form stays locked.
export function isFinal(outcome: CheckInOutcome): boolean {
  return (
    outcome === "checked-in" ||
    outcome === "already-checked-in" ||
    outcome === "session-closed" ||
    needsNewScan(outcome)
  );
}

// Retry-After in whole seconds, when core's answer carries a readable one.
// Cross-origin the browser only shows it if the edge exposes the header.
export function retryAfterSeconds(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds);
}

export type OutcomeMessage = {
  tone: "success" | "info" | "error";
  title: string;
  detail: string;
};

export function messageFor(outcome: CheckInOutcome, retryAfter: number | null = null): OutcomeMessage {
  switch (outcome) {
    case "checked-in":
      return {
        tone: "success",
        title: "Girişiniz alındı",
        detail: "Etkinliğe hoş geldiniz. Bu sayfayı kapatabilirsiniz.",
      };
    case "already-checked-in":
      return {
        tone: "info",
        title: "Girişiniz zaten alınmış",
        detail: "Bu oturuma girişiniz daha önce kaydedildi. Yeniden bir şey yapmanız gerekmiyor.",
      };
    case "invalid-email":
      return {
        tone: "error",
        title: "E-posta adresini kontrol edin",
        detail: "Kayıt olurken kullandığınız e-posta adresini eksiksiz yazıp yeniden deneyin.",
      };
    case "no-ticket":
      return {
        tone: "error",
        title: "Bu e-postayla kaydınız yok",
        detail:
          "Bu e-posta adresiyle bu etkinliğe kayıt bulunamadı. Kayıt olurken kullandığınız adresi deneyin ya da kapıdaki görevliye başvurun.",
      };
    case "session-closed":
      return {
        tone: "error",
        title: "Bu oturum şu an giriş almıyor",
        detail: "Oturumun giriş saati dışındasınız ya da oturum iptal edildi. Kapıdaki görevliye başvurun.",
      };
    case "scan-required":
      return {
        tone: "error",
        title: "Kapıdaki QR kodu okutun",
        detail: "Bu sayfa kapıdaki ekranda gösterilen QR kodla açılır. QR kodu telefonunuzun kamerasıyla okutun.",
      };
    case "qr-invalid":
      return {
        tone: "error",
        title: "Bu QR kod bu oturuma ait değil",
        detail: "Kapıdaki ekranda gösterilen QR kodu yeniden okutun.",
      };
    case "qr-expired":
      return {
        tone: "error",
        title: "QR kodun süresi doldu",
        detail: "Ekrandaki QR kod birkaç saniyede bir yenilenir. Kapıdaki QR kodu yeniden okutun.",
      };
    case "qr-used-up":
      return {
        tone: "error",
        title: "Bu QR kod çok kullanıldı",
        detail: "Kapıdaki ekranda gösterilen yeni QR kodu okutun.",
      };
    case "rate-limited":
      return {
        tone: "error",
        title: "Çok fazla hatalı deneme",
        detail: retryAfter
          ? `${retryAfter} saniye bekleyip yeniden deneyin.`
          : "Bir dakika kadar bekleyip yeniden deneyin.",
      };
    case "network":
      return {
        tone: "error",
        title: "Bağlantı kurulamadı",
        detail: "İnternet bağlantınızı kontrol edip yeniden deneyin.",
      };
    case "unavailable":
      return {
        tone: "error",
        title: "Giriş şu an alınamıyor",
        detail: "Biraz sonra yeniden deneyin ya da kapıdaki görevliye başvurun.",
      };
  }
}
