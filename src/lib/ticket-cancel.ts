// The holder cancels their own ticket from its page (/bilet/[key]).
//
// Core says on GET /v1/public/tickets/{key} whether the holder may cancel now
// (`cancellable`: an active ticket until its Event starts, a waitlisted one
// until it ends). The page then offers "Biletimi iptal et" ("Listeden çık" on
// the waiting list); the browser posts to this site's /bilet/<key>/iptal, and
// the site posts core's POST /v1/public/tickets/{key}/cancel
// (core-backend docs/ticket-cancellation.md). An older core sends no
// `cancellable`, so the page offers nothing.
//
// No node: imports here: the browser runs this file too.

export function ticketCancelUrl(origin: string, key: string): string {
  return `${origin}/v1/public/tickets/${key}/cancel`;
}

export type CancelRefusal = "ticket_cancel_closed" | "ticket_checked_in" | "ticket_in_competition";

export type CancelOutcome =
  | { kind: "cancelled" }
  | { kind: "refused"; code: CancelRefusal | null }
  | { kind: "not-found" }
  | { kind: "limited" }
  | { kind: "failed" };

const REFUSALS: readonly string[] = ["ticket_cancel_closed", "ticket_checked_in", "ticket_in_competition"];

// Core's answer to the cancel: 200 {"state":"ticket_cancelled"} (again for a
// ticket already cancelled), 409 with a code, 404, 429.
export function cancelOutcomeFor(status: number, body: unknown): CancelOutcome {
  if (status >= 200 && status < 300) return { kind: "cancelled" };
  if (status === 404 || status === 410) return { kind: "not-found" };
  if (status === 429) return { kind: "limited" };
  if (status === 409) {
    const code = body && typeof body === "object" ? (body as Record<string, unknown>).code : null;
    return { kind: "refused", code: typeof code === "string" && REFUSALS.includes(code) ? (code as CancelRefusal) : null };
  }
  return { kind: "failed" };
}

// What the dialog says when the cancel did not go through.
export function cancelProblem(outcome: CancelOutcome): string | null {
  switch (outcome.kind) {
    case "cancelled":
      return null;
    case "refused":
      if (outcome.code === "ticket_cancel_closed") return "Etkinlik başladı; bilet artık iptal edilemez.";
      if (outcome.code === "ticket_checked_in") return "Girişin yazılmış; bilet iptal edilemez.";
      if (outcome.code === "ticket_in_competition") return "Yarışmaya kayıtlısın; bilet iptal edilemez.";
      return "Bilet iptal edilemez.";
    case "not-found":
      return "Bilet bulunamadı.";
    case "limited":
      return "Çok fazla deneme. Biraz sonra yeniden dene.";
    default:
      return "Bilet iptal edilemedi. Biraz sonra yeniden dene.";
  }
}

// The button and the question, for an active ticket and for the waiting list.
export function cancelCopy(waitlisted: boolean): { button: string; title: string; detail: string; action: string } {
  return waitlisted
    ? {
        button: "Listeden çık",
        title: "Bekleme listesinden çıkılsın mı?",
        detail: "Sıran silinir. Geri almak için düzenleyene yazman gerekir.",
        action: "Listeden çık",
      }
    : {
        button: "Biletimi iptal et",
        title: "Bilet iptal edilsin mi?",
        detail: "Biletin iptal edilecek. Geri almak için düzenleyene yazman gerekir.",
        action: "Bileti iptal et",
      };
}
