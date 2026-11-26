// The ticket page greets its holder at the door (/bilet/[key]).
//
// While the page is open on the Event's day, the browser asks this site's
// /bilet/<key>/girisler every few seconds; the site asks core's
// GET /v1/public/tickets/{key}/check-ins (core-backend docs/ticket-page.md),
// which answers the Ticket's own check-ins: the Session's title and when,
// nothing else. When a new one appears, the page shows "Hoş geldin".
//
// No node: imports here: the browser runs this file too.

export type TicketCheckIn = { session: string; at: string };

export function checkInsLookupUrl(origin: string, key: string): string {
  return `${origin}/v1/public/tickets/${key}/check-ins`;
}

// Core's answer, read defensively: a list of {session, at}, or null.
export function parseCheckIns(body: unknown): TicketCheckIn[] | null {
  if (!body || typeof body !== "object") return null;
  const list = (body as Record<string, unknown>).checkIns;
  if (!Array.isArray(list)) return null;
  const out: TicketCheckIn[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const at = typeof raw.at === "string" ? raw.at : "";
    if (!at || Number.isNaN(new Date(at).getTime())) continue;
    out.push({ session: typeof raw.session === "string" ? raw.session.trim() : "", at });
  }
  return out;
}

const HOUR = 60 * 60 * 1000;

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// The door's hours: from three hours before the Event to its end (the end
// date, else a day after the start, ADR 0066). The card opens on its QR then,
// and the page asks for check-ins only then. An Event with no date, or one
// that is not active, has none.
export function atDoorHours(
  ticket: { state: string; eventStart: string | null; eventEnd: string | null },
  now: Date,
): boolean {
  if (ticket.state !== "active") return false;
  const start = parseDate(ticket.eventStart);
  if (!start) return false;
  const end = parseDate(ticket.eventEnd) ?? new Date(start.getTime() + 24 * HOUR);
  const t = now.getTime();
  return t >= start.getTime() - 3 * HOUR && t <= end.getTime();
}

const istanbulDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function sameIstanbulDay(a: Date, b: Date): boolean {
  return istanbulDay.format(a) === istanbulDay.format(b);
}

// Whether the holder is already in today: then the page does not ask at all.
export function inToday(checkIns: readonly TicketCheckIn[], now: Date): boolean {
  return checkIns.some((c) => sameIstanbulDay(new Date(c.at), now));
}

// The newest check-in of `now` that `before` did not have, or null.
export function newCheckIn(before: readonly TicketCheckIn[], now: readonly TicketCheckIn[]): TicketCheckIn | null {
  const seen = new Set(before.map((c) => `${c.at}|${c.session}`));
  const fresh = now.filter((c) => !seen.has(`${c.at}|${c.session}`));
  if (fresh.length === 0) return null;
  return fresh.reduce((a, b) => (new Date(b.at).getTime() > new Date(a.at).getTime() ? b : a));
}

// "Elif" of "Elif Yılmaz": the greeting uses the first name.
export function firstName(holderName: string): string {
  return holderName.trim().split(/\s+/)[0] ?? "";
}

const clock = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "Açılış · 10.05" (TDK writes the hour with a full stop).
export function checkInLine(checkIn: TicketCheckIn): string {
  const time = clock.format(new Date(checkIn.at)).replace(":", ".");
  return checkIn.session ? `${checkIn.session} · ${time}` : time;
}

// How long to wait before the next question: every 4 seconds, a little
// jitter so the pages at the door do not ask together; longer after a
// refusal (429: a minute) or a failure (doubling, at most a minute).
export const POLL_MS = 4000;

export function nextDelay(outcome: "ok" | "limited" | "failed", failures: number, random = Math.random): number {
  if (outcome === "limited") return 60_000;
  if (outcome === "failed") return Math.min(60_000, POLL_MS * 2 ** Math.max(1, failures));
  return POLL_MS - 500 + Math.round(random() * 1000);
}

// What one question came to: the list, stop for good (404, 410: the ticket
// or its page is gone), wait long (429) or try again.
export type CheckInsLookup =
  | { kind: "ok"; checkIns: TicketCheckIn[] }
  | { kind: "stop" }
  | { kind: "limited" }
  | { kind: "failed" };

export function lookupFromStatus(status: number, body: unknown): CheckInsLookup {
  if (status === 404 || status === 410) return { kind: "stop" };
  if (status === 429) return { kind: "limited" };
  if (status < 200 || status >= 300) return { kind: "failed" };
  const checkIns = parseCheckIns(body);
  return checkIns ? { kind: "ok", checkIns } : { kind: "failed" };
}

// The small logo next to the organizer on the greeting: the club's own
// files in public/img, for the teams and events that have one there (the
// same files the site's pages use). Nothing else: an Event of another team
// shows its name alone. An Event in the ARTLAB theme (core's theme.key)
// shows ARTLAB's 2026 icon (artlab-site's src/app/icon.svg), whatever its name.
export type OrganizerLogo = { src: string; alt: string };

const THEME_LOGOS: Record<string, OrganizerLogo> = {
  artlab: { src: "/img/events/artlab-2026.svg", alt: "ARTLAB" },
};

const EVENT_LOGOS: { match: RegExp; logo: OrganizerLogo }[] = [
  { match: /gece\s*kodu/i, logo: { src: "/img/teams/gecekodubeyaz.png", alt: "GECEKODU" } },
  { match: /sky\s*days/i, logo: { src: "/img/events/skydays.png", alt: "SKYDAYS" } },
  { match: /y[ıi]ld[ıi]z\s*jam/i, logo: { src: "/img/events/yildizjam.png", alt: "YıldızJam" } },
];

const TEAM_LOGOS: Record<string, OrganizerLogo> = {
  WEBLAB: { src: "/img/teams/weblablogobeyaz.svg", alt: "WEBLAB" },
  GECEKODU: { src: "/img/teams/gecekodubeyaz.png", alt: "GECEKODU" },
};

export function organizerLogo(ownerTeam: string, eventName: string, theme = ""): OrganizerLogo | null {
  if (Object.hasOwn(THEME_LOGOS, theme)) return THEME_LOGOS[theme];
  const event = EVENT_LOGOS.find((e) => e.match.test(eventName));
  if (event) return event.logo;
  return TEAM_LOGOS[ownerTeam.trim().toUpperCase()] ?? null;
}
