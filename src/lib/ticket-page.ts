// The ticket page (/bilet/[key], ADR 0082 in skylab-kulubu/e-skylab).
//
// A Ticket opens without a sign-in by its access key: the link in the
// "Biletin hazır" mail is the right to read, since a guest has no account.
// The page reads core's public GET /v1/public/tickets/{key} on the server
// (core-backend docs/ticket-page.md) and draws the ticket as a card: the
// front is the Event's cover, the back its details and the QR. The browser
// loads the QR image and the PDF from core's own addresses in that answer.
//
// The key is a secret: it is never logged, never sent anywhere but core, and
// the page sends no Referer (next.config.ts).

import { isIP } from "node:net";

import { atDoorHours, checkInsLookupUrl, lookupFromStatus, type CheckInsLookup } from "./ticket-check-ins.ts";
import { cancelOutcomeFor, ticketCancelUrl, type CancelOutcome } from "./ticket-cancel.ts";

const PRODUCTION_CORE = "https://api.yildizskylab.com";

// The club's purple, the card's colour when the Event has none of its own
// (core's Kurumsal theme uses the same).
export const SKYLAB_PURPLE = "#7C3AED";

// The Event's look, core's theme.key: "artlab" draws the card in ARTLAB's own
// colours (artlab-site's globals.css, the 2026 theme), anything else, or none
// from an older core, is the club's Kurumsal look.
export type TicketTheme = "kurumsal" | "artlab";

export function themeKey(theme: unknown): TicketTheme {
  const key = theme && typeof theme === "object" ? (theme as Record<string, unknown>).key : null;
  return typeof key === "string" && key.trim().toLowerCase() === "artlab" ? "artlab" : "kurumsal";
}

// ARTLAB's ground and its accent (artlab-site --bg and --amber).
export const ARTLAB_GROUND = "#0B0E13";
export const ARTLAB_AMBER = "#F5B82E";

// 26 characters of A–Z and 2–7 (128 random bits, base32). Anything else is
// answered "not found" without asking core, as core itself would.
const TICKET_KEY = /^[A-Z2-7]{26}$/;

export function isTicketKey(value: string): boolean {
  return TICKET_KEY.test(value);
}

// Core's origin is CORE_API_ORIGIN, which next.config.ts writes into the build
// from API_BASE_URL (production api., sandbox sandbox-api.). An image built
// without it asks production core, as /sertifika does.
export function coreOrigin(coreApiOrigin: string | undefined): string {
  return new URL(coreApiOrigin || PRODUCTION_CORE).origin;
}

export function ticketLookupUrl(coreApiOrigin: string | undefined, key: string): string {
  return `${coreOrigin(coreApiOrigin)}/v1/public/tickets/${key}`;
}

// CORE_INTERNAL_URL (optional, read on the server at run time, never sent to
// the browser): core on the deployment's internal network, e.g.
// http://sky-lab-production-core-8qn0in:8080. The page's server asks core there
// rather than through the public edge, as one service calls another, so the
// X-Forwarded-For it sends reaches core as written. Unset or not an http(s)
// address, the server asks the public origin as before. The QR and PDF links
// the browser follows stay on core's public origin.
export function internalCoreOrigin(coreInternalUrl: string | undefined): string | null {
  if (!coreInternalUrl?.trim()) return null;
  try {
    const url = new URL(coreInternalUrl.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

// ticket_cancelled and waitlisted (core-backend docs/ticket-cancellation.md,
// docs/event-capacity.md): the ticket opens no door, so the page shows no QR.
export type TicketState = "active" | "ended" | "event_cancelled" | "ticket_cancelled" | "waitlisted";

const STATES: readonly string[] = ["active", "ended", "event_cancelled", "ticket_cancelled", "waitlisted"];

// The states that carry no QR and no PDF.
export function opensNoDoor(state: TicketState): boolean {
  return state === "event_cancelled" || state === "ticket_cancelled" || state === "waitlisted";
}

// Core's answer, read defensively. The cover, its colours, the Event's own
// ticket colour and the place's point are read when core sends them; the
// page draws the ticket without them.
export type PublicTicket = {
  eventName: string;
  eventStart: string | null;
  eventEnd: string | null;
  venue: string;
  ownerTeam: string;
  organizerName: string;
  holderName: string;
  code: string;
  qrUrl: string | null;
  pdfUrl: string | null;
  state: TicketState;
  // Whether the holder may cancel it from the page now; false from a core
  // that does not say.
  cancellable: boolean;
  mapsUrl: string | null;
  venueLat: number | null;
  venueLng: number | null;
  coverImageUrl: string | null;
  coverColors: string[];
  ticketAccentColor: string | null;
  // theme.accent: the colour core gives the ticket (its PDF has the same).
  themeAccent: string | null;
  // theme.key: the Event's look.
  theme: TicketTheme;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const optionalText = (value: unknown) => text(value) || null;
const number = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export function parseTicket(body: unknown): PublicTicket | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const state = raw.state;
  if (typeof state !== "string" || !STATES.includes(state)) return null;
  const eventName = text(raw.eventName);
  if (!eventName) return null;
  return {
    eventName,
    eventStart: optionalText(raw.eventStart),
    eventEnd: optionalText(raw.eventEnd),
    venue: text(raw.venue),
    ownerTeam: text(raw.ownerTeam),
    organizerName: text(raw.organizerName),
    holderName: text(raw.holderName),
    code: text(raw.code),
    qrUrl: optionalText(raw.qrUrl),
    pdfUrl: optionalText(raw.pdfUrl),
    state: state as TicketState,
    cancellable: raw.cancellable === true,
    mapsUrl: optionalText(raw.mapsUrl),
    venueLat: number(raw.venueLat),
    venueLng: number(raw.venueLng),
    coverImageUrl: optionalText(raw.coverImageUrl),
    coverColors: Array.isArray(raw.coverColors) ? raw.coverColors.filter((c): c is string => typeof c === "string") : [],
    ticketAccentColor: optionalText(raw.ticketAccentColor),
    themeAccent:
      raw.theme && typeof raw.theme === "object" ? optionalText((raw.theme as Record<string, unknown>).accent) : null,
    theme: themeKey(raw.theme),
  };
}

export type TicketLookup =
  | { kind: "found"; ticket: PublicTicket }
  | { kind: "not-found" }
  | { kind: "closed" }
  | { kind: "unavailable" };

// The visitor's address, as the edge proxy saw it: the last X-Forwarded-For
// entry, which Traefik appends itself (it drops the header a client sends), else
// X-Real-Ip. CF-Connecting-IP is not read: yildizskylab.com is not behind
// Cloudflare, so a visitor could write it. Null when there is no address.
export function visitorAddress(forwardedFor: string | null, realIp: string | null): string | null {
  const last = forwardedFor?.split(",").map((part) => part.trim()).filter(Boolean).pop() ?? realIp?.trim() ?? "";
  return isIP(last) ? last : null;
}

// 404: no such ticket (or a draft Event's, an erased holder's). 410
// ticket_page_closed: the Event ended more than a week ago. Anything else,
// or no answer, is "unavailable"; nothing is logged, since the address holds
// the key.
//
// The page asks core from this site's server, so core would count every
// visitor as one client. The visitor's address goes along as X-Forwarded-For,
// which core believes only from the site's internal address (its proxy list),
// so it counts only when the server asks core over CORE_INTERNAL_URL.
export async function findTicket(
  key: string,
  coreApiOrigin: string | undefined,
  {
    fetchImpl = fetch,
    visitor = null,
    coreInternalUrl,
  }: { fetchImpl?: typeof fetch; visitor?: string | null; coreInternalUrl?: string } = {},
): Promise<TicketLookup> {
  if (!isTicketKey(key)) return { kind: "not-found" };
  try {
    const response = await fetchImpl(ticketLookupUrl(internalCoreOrigin(coreInternalUrl) ?? coreApiOrigin, key), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      ...(visitor ? { headers: { "X-Forwarded-For": visitor } } : {}),
    });
    if (response.status === 404) return { kind: "not-found" };
    if (response.status === 410) return { kind: "closed" };
    if (!response.ok) return { kind: "unavailable" };
    const ticket = parseTicket(await response.json());
    return ticket ? { kind: "found", ticket } : { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
}

// The holder's own check-ins (GET /v1/public/tickets/{key}/check-ins), asked
// from this site's server as findTicket does: over CORE_INTERNAL_URL when set,
// with the visitor's address. Nothing is logged: the address holds the key.
export async function findCheckIns(
  key: string,
  coreApiOrigin: string | undefined,
  {
    fetchImpl = fetch,
    visitor = null,
    coreInternalUrl,
  }: { fetchImpl?: typeof fetch; visitor?: string | null; coreInternalUrl?: string } = {},
): Promise<CheckInsLookup> {
  if (!isTicketKey(key)) return { kind: "stop" };
  try {
    const origin = coreOrigin(internalCoreOrigin(coreInternalUrl) ?? coreApiOrigin);
    const response = await fetchImpl(checkInsLookupUrl(origin, key), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      ...(visitor ? { headers: { "X-Forwarded-For": visitor } } : {}),
    });
    const body = response.ok ? await response.json().catch(() => null) : null;
    return lookupFromStatus(response.status, body);
  } catch {
    return { kind: "failed" };
  }
}

// The holder's cancel (POST /v1/public/tickets/{key}/cancel), asked from this
// site's server as findTicket does: over CORE_INTERNAL_URL when set, with the
// visitor's address. Nothing is logged: the address holds the key.
export async function requestCancel(
  key: string,
  coreApiOrigin: string | undefined,
  {
    fetchImpl = fetch,
    visitor = null,
    coreInternalUrl,
  }: { fetchImpl?: typeof fetch; visitor?: string | null; coreInternalUrl?: string } = {},
): Promise<CancelOutcome> {
  if (!isTicketKey(key)) return { kind: "not-found" };
  try {
    const origin = coreOrigin(internalCoreOrigin(coreInternalUrl) ?? coreApiOrigin);
    const response = await fetchImpl(ticketCancelUrl(origin, key), {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      ...(visitor ? { headers: { "X-Forwarded-For": visitor } } : {}),
    });
    const body = await response.json().catch(() => null);
    return cancelOutcomeFor(response.status, body);
  } catch {
    return { kind: "failed" };
  }
}

// An address from core's answer the browser may load: https, or on core's own
// origin (a local core in development). Core sends paths when its
// PUBLIC_API_ORIGIN is unset; they are core's.
export function trustedUrl(value: string | null, coreApiOrigin: string | undefined): string | null {
  if (!value) return null;
  try {
    const origin = coreOrigin(coreApiOrigin);
    const url = new URL(value, origin);
    return url.protocol === "https:" || url.origin === origin ? url.toString() : null;
  } catch {
    return null;
  }
}

// The club's media hosts: an Event's cover is loaded only from them (or from
// core itself), so a visitor's browser never calls a host an editor typed in.
const MEDIA_HOSTS = new Set(["cdn.yildizskylab.com", "sandbox-cdn.yildizskylab.com"]);

export function coverUrl(value: string | null, coreApiOrigin: string | undefined): string | null {
  const url = trustedUrl(value, coreApiOrigin);
  if (!url) return null;
  const { hostname, origin } = new URL(url);
  return MEDIA_HOSTS.has(hostname) || origin === coreOrigin(coreApiOrigin) ? url : null;
}

// The club's name, as core and the ticket PDF write it.
export const CLUB_NAME = "SKY LAB: Bilgisayar Bilimleri Kulübü";

// Who organizes the Event: core's organizerName (the club's name for an
// Event of YK, DK or ADMIN, else the team). An older core sends ownerTeam
// alone: the club's boards, ADMIN and no team sign as the club.
export function organizerName(organizer: string, ownerTeam: string): string {
  const named = organizer.trim();
  if (named) return named;
  const team = ownerTeam.trim();
  return !team || ["YK", "DK", "ADMIN"].includes(team.toUpperCase()) ? CLUB_NAME : team;
}

const ISTANBUL = "Europe/Istanbul";
const dayFormat = new Intl.DateTimeFormat("tr-TR", {
  timeZone: ISTANBUL,
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});
const timeFormat = new Intl.DateTimeFormat("tr-TR", {
  timeZone: ISTANBUL,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: ISTANBUL, year: "numeric", month: "2-digit", day: "2-digit" });

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "12 Aralık 2026 Cumartesi"
function dayLabel(date: Date): string {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dayFormat.formatToParts(date).find((p) => p.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")} ${part("weekday")}`;
}

// "10.00": TDK writes the hour with a full stop.
function timeLabel(date: Date): string {
  return timeFormat.format(date).replace(":", ".");
}

// A date line, its last part (the hours) kept on one line: the page breaks the
// line after the date, never inside "10.00–18.00".
export type When = { date: string; hours: string };

// The front: the day and the start, "12 Aralık 2026 Cumartesi, 10.00".
export function frontWhen(eventStart: string | null): When | null {
  const start = parseDate(eventStart);
  return start ? { date: dayLabel(start), hours: timeLabel(start) } : null;
}

// The back: "12 Aralık 2026 Cumartesi, 10.00–18.00" (TDK: a range takes the
// en dash). Over several days: "12 Aralık 2026 Cumartesi, 10.00 – 13 Aralık
// 2026 Pazar, 18.00".
export function backWhen(eventStart: string | null, eventEnd: string | null): When | null {
  const start = parseDate(eventStart);
  if (!start) return null;
  const end = parseDate(eventEnd);
  if (!end || end <= start) return { date: dayLabel(start), hours: timeLabel(start) };
  if (dateKey.format(start) === dateKey.format(end)) {
    return { date: dayLabel(start), hours: `${timeLabel(start)}–${timeLabel(end)}` };
  }
  return { date: `${dayLabel(start)}, ${timeLabel(start)} – ${dayLabel(end)}`, hours: timeLabel(end) };
}

// The face the card opens on: the QR in the door's hours, from three hours
// before the Event until its end (the end date, else a day after the start,
// ADR 0066), the cover otherwise.
export function openingFace(ticket: Pick<PublicTicket, "state" | "eventStart" | "eventEnd">, now: Date): "front" | "back" {
  return atDoorHours(ticket, now) ? "back" : "front";
}

const HEX = /^#[0-9a-f]{6}$/i;

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05);
}

export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// The card's colour: the Event's ticket colour (ticketAccentColor, else core's
// theme.accent), else its cover's first colour, else the club's purple;
// darkened until white text on it reaches 4.5:1 (WCAG AA), since a cover's
// colour may be light.
export function cardColor(accents: (string | null)[], coverColors: string[]): string {
  let hex = [...accents, coverColors[0]].find((c): c is string => !!c && HEX.test(c)) ?? SKYLAB_PURPLE;
  hex = hex.toLowerCase();
  while (contrastWithWhite(hex) < 4.5) {
    const darker = [1, 3, 5].map((i) => Math.floor(parseInt(hex.slice(i, i + 2), 16) * 0.9));
    hex = `#${darker.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  return hex;
}

// The ARTLAB card's accent, on ARTLAB's dark ground: the Event's ticket colour,
// else ARTLAB's amber; lightened until it reaches 4.5:1 on the ground (WCAG
// AA), since the accent colours text there.
export function artlabAccent(ticketAccentColor: string | null): string {
  let hex = (ticketAccentColor && HEX.test(ticketAccentColor) ? ticketAccentColor : ARTLAB_AMBER).toLowerCase();
  while (contrast(hex, ARTLAB_GROUND) < 4.5) {
    const lighter = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16);
      return Math.ceil(c + (255 - c) * 0.1);
    });
    hex = `#${lighter.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  return hex;
}

// "Haritada aç": core's own link when it sends one, else Google Maps at the
// place's point, else a search for its name. A link only: nothing embedded,
// no key.
export function mapsLink(ticket: Pick<PublicTicket, "mapsUrl" | "venueLat" | "venueLng" | "venue">): string | null {
  if (ticket.mapsUrl) {
    try {
      const url = new URL(ticket.mapsUrl);
      if (url.protocol === "https:") return url.toString();
    } catch {
      // fall through to a link of our own
    }
  }
  const search = "https://www.google.com/maps/search/?api=1&query=";
  if (ticket.venueLat !== null && ticket.venueLng !== null) {
    return search + encodeURIComponent(`${ticket.venueLat},${ticket.venueLng}`);
  }
  return ticket.venue ? search + encodeURIComponent(ticket.venue) : null;
}

// What the card draws: plain data, handed from the server to the browser.
export type TicketView = {
  state: TicketState;
  theme: TicketTheme;
  eventName: string;
  organizer: string;
  front: When | null;
  back: When | null;
  venue: string;
  holderName: string;
  code: string;
  color: string;
  coverSrc: string | null;
  qrSrc: string | null;
  pdfHref: string | null;
  mapsHref: string | null;
  openFace: "front" | "back";
};

export function ticketView(ticket: PublicTicket, coreApiOrigin: string | undefined, now: Date): TicketView {
  const cancelled = opensNoDoor(ticket.state);
  const cover = coverUrl(ticket.coverImageUrl, coreApiOrigin);
  return {
    state: ticket.state,
    theme: ticket.theme,
    eventName: ticket.eventName,
    organizer: organizerName(ticket.organizerName, ticket.ownerTeam),
    front: frontWhen(ticket.eventStart),
    back: backWhen(ticket.eventStart, ticket.eventEnd),
    venue: ticket.venue,
    holderName: ticket.holderName,
    code: ticket.code,
    // Kurumsal: the card is the colour (ticketAccentColor, core's theme.accent, the cover's first,
    // the purple). ARTLAB: the card is ARTLAB's ground and the colour its accent (ticketAccentColor,
    // else ARTLAB's amber).
    color:
      ticket.theme === "artlab"
        ? artlabAccent(ticket.ticketAccentColor)
        : cardColor([ticket.ticketAccentColor, ticket.themeAccent], ticket.coverColors),
    coverSrc: cover,
    qrSrc: cancelled ? null : trustedUrl(ticket.qrUrl, coreApiOrigin),
    pdfHref: cancelled ? null : trustedUrl(ticket.pdfUrl, coreApiOrigin),
    mapsHref: mapsLink(ticket),
    openFace: openingFace(ticket, now),
  };
}
