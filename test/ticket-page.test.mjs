import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  backWhen,
  cardColor,
  contrastWithWhite,
  findTicket,
  frontWhen,
  isTicketKey,
  mapsLink,
  openingFace,
  parseTicket,
  SKYLAB_PURPLE,
  ticketLookupUrl,
  ticketView,
  trustedUrl,
} from "../src/lib/ticket-page.ts";

const KEY = "K7M2QXZFABCDEFGHJKLMNPQRST";
const CORE = "https://sandbox-api.yildizskylab.com";

// Core's GET /v1/public/tickets/{key} (core-backend docs/ticket-page.md).
const answer = (extra = {}) => ({
  eventName: "Yapay Zeka Kampı",
  eventStart: "2026-12-12T07:00:00Z",
  eventEnd: "2026-12-12T15:00:00Z",
  venue: "YTÜ Davutpaşa, EEF Konferans Salonu",
  ownerTeam: "AILAB",
  eventStatus: "published",
  holderName: "Elif Yılmaz",
  code: "K7M2-QX9F",
  qrToken: "eyJ…",
  qrUrl: `${CORE}/v1/public/tickets/${KEY}/qr.png`,
  pdfUrl: `${CORE}/v1/public/tickets/${KEY}/pdf`,
  state: "active",
  theme: { key: "kurumsal", accent: "#7C3AED" },
  ...extra,
});

const respond = (status, body) => async () =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

test("a key is 26 characters of A–Z and 2–7", () => {
  assert.equal(isTicketKey(KEY), true);
  for (const bad of ["", KEY.toLowerCase(), KEY.slice(1), `${KEY}A`, KEY.replace("K", "1"), KEY.replace("K", "8"), `${KEY.slice(0, 25)}/`]) {
    assert.equal(isTicketKey(bad), false, bad);
  }
});

test("the lookup goes to the core the image was built for, production without one", () => {
  assert.equal(ticketLookupUrl(CORE, KEY), `${CORE}/v1/public/tickets/${KEY}`);
  assert.equal(ticketLookupUrl("https://api.yildizskylab.com/v1/", KEY), `https://api.yildizskylab.com/v1/public/tickets/${KEY}`);
  for (const origin of [undefined, ""]) {
    assert.equal(ticketLookupUrl(origin, KEY), `https://api.yildizskylab.com/v1/public/tickets/${KEY}`);
  }
});

test("a malformed key never reaches core", async () => {
  let calls = 0;
  const counting = async () => {
    calls++;
    return new Response("{}");
  };
  for (const bad of ["x", "kapi", KEY.toLowerCase(), `${KEY}/qr.png`, "../../v1/sessions"]) {
    assert.deepEqual(await findTicket(bad, CORE, counting), { kind: "not-found" });
  }
  assert.equal(calls, 0);
});

test("core's answer decides the page's state", async () => {
  assert.equal((await findTicket(KEY, CORE, respond(200, answer()))).kind, "found");
  assert.deepEqual(await findTicket(KEY, CORE, respond(404, { status: 404 })), { kind: "not-found" });
  assert.deepEqual(await findTicket(KEY, CORE, respond(410, { code: "ticket_page_closed" })), { kind: "closed" });
  assert.deepEqual(await findTicket(KEY, CORE, respond(500, { status: 500 })), { kind: "unavailable" });
  assert.deepEqual(await findTicket(KEY, CORE, respond(429, { status: 429 })), { kind: "unavailable" });
  assert.deepEqual(await findTicket(KEY, CORE, respond(200, { nothing: true })), { kind: "unavailable" });
  const offline = async () => {
    throw new TypeError("fetch failed");
  };
  assert.deepEqual(await findTicket(KEY, CORE, offline), { kind: "unavailable" });
});

test("the lookup is never cached and asks the ticket's own address", async () => {
  let seen;
  await findTicket(KEY, CORE, async (url, init) => {
    seen = { url, cache: init?.cache };
    return new Response(JSON.stringify(answer()));
  });
  assert.deepEqual(seen, { url: `${CORE}/v1/public/tickets/${KEY}`, cache: "no-store" });
});

test("an answer is read only with a known state and a name", () => {
  assert.equal(parseTicket(answer({ state: "ticket_cancelled" })), null);
  assert.equal(parseTicket(answer({ eventName: " " })), null);
  assert.equal(parseTicket(null), null);
  const ticket = parseTicket(answer({ coverColors: ["#26446e", 3], venueLat: 41.02, venueLng: "28.9" }));
  assert.deepEqual(ticket.coverColors, ["#26446e"]);
  assert.equal(ticket.venueLat, 41.02);
  assert.equal(ticket.venueLng, null);
});

test("dates are Istanbul's, in TDK's style", () => {
  assert.deepEqual(frontWhen("2026-12-12T07:00:00Z"), { date: "12 Aralık 2026 Cumartesi", hours: "10.00" });
  assert.deepEqual(backWhen("2026-12-12T07:00:00Z", "2026-12-12T15:00:00Z"), {
    date: "12 Aralık 2026 Cumartesi",
    hours: "10.00–18.00",
  });
  assert.deepEqual(backWhen("2026-12-12T07:00:00Z", "2026-12-13T15:00:00Z"), {
    date: "12 Aralık 2026 Cumartesi, 10.00 – 13 Aralık 2026 Pazar",
    hours: "18.00",
  });
  assert.deepEqual(backWhen("2026-12-12T07:00:00Z", null), { date: "12 Aralık 2026 Cumartesi", hours: "10.00" });
  // 23.30 in Istanbul is still the 12th.
  assert.deepEqual(frontWhen("2026-12-12T20:30:00Z"), { date: "12 Aralık 2026 Cumartesi", hours: "23.30" });
  assert.equal(frontWhen(null), null);
  assert.equal(backWhen("not a date", null), null);
});

test("the card opens on the QR from three hours before the Event until its end", () => {
  const ticket = { state: "active", eventStart: "2026-12-12T07:00:00Z", eventEnd: "2026-12-12T15:00:00Z" };
  assert.equal(openingFace(ticket, new Date("2026-12-12T03:59:00Z")), "front");
  assert.equal(openingFace(ticket, new Date("2026-12-12T04:00:00Z")), "back");
  assert.equal(openingFace(ticket, new Date("2026-12-12T15:00:00Z")), "back");
  assert.equal(openingFace(ticket, new Date("2026-12-12T15:01:00Z")), "front");
  // No end: a day after the start (ADR 0066).
  const open = { ...ticket, eventEnd: null };
  assert.equal(openingFace(open, new Date("2026-12-13T06:59:00Z")), "back");
  assert.equal(openingFace(open, new Date("2026-12-13T07:01:00Z")), "front");
  assert.equal(openingFace({ ...ticket, state: "ended" }, new Date("2026-12-12T08:00:00Z")), "front");
  assert.equal(openingFace({ ...ticket, eventStart: null }, new Date("2026-12-12T08:00:00Z")), "front");
});

test("the card's colour: the Event's, its cover's, else the club's purple, always readable in white", () => {
  assert.equal(cardColor(null, []), SKYLAB_PURPLE.toLowerCase());
  assert.equal(cardColor("#26446E", ["#d9c34a"]), "#26446e");
  assert.equal(cardColor(null, ["#26446e"]), "#26446e");
  assert.equal(cardColor("teal", ["nope"]), SKYLAB_PURPLE.toLowerCase());
  for (const light of ["#ffffff", "#e0c8e5", "#d9c34a", "#7fffd4"]) {
    const color = cardColor(light, []);
    assert.ok(contrastWithWhite(color) >= 4.5, `${light} → ${color}`);
  }
});

test("addresses from core load only over https or from core itself", () => {
  assert.equal(trustedUrl(`${CORE}/v1/public/tickets/${KEY}/qr.png`, CORE), `${CORE}/v1/public/tickets/${KEY}/qr.png`);
  assert.equal(trustedUrl(`/v1/public/tickets/${KEY}/pdf`, CORE), `${CORE}/v1/public/tickets/${KEY}/pdf`);
  assert.equal(trustedUrl("http://127.0.0.1:4610/x.png", "http://127.0.0.1:4610"), "http://127.0.0.1:4610/x.png");
  assert.equal(trustedUrl("http://evil.example/x.png", CORE), null);
  assert.equal(trustedUrl("javascript:alert(1)", CORE), null);
  assert.equal(trustedUrl(null, CORE), null);
});

test("Haritada aç: core's link, else the point, else the place's name", () => {
  const base = { mapsUrl: null, venueLat: null, venueLng: null, venue: "YTÜ Davutpaşa" };
  assert.equal(
    mapsLink({ ...base, mapsUrl: "https://www.google.com/maps/search/?api=1&query=41.02%2C28.88" }),
    "https://www.google.com/maps/search/?api=1&query=41.02%2C28.88",
  );
  assert.equal(mapsLink({ ...base, venueLat: 41.02, venueLng: 28.88 }), "https://www.google.com/maps/search/?api=1&query=41.02%2C28.88");
  assert.equal(mapsLink(base), "https://www.google.com/maps/search/?api=1&query=YT%C3%9C%20Davutpa%C5%9Fa");
  assert.equal(mapsLink({ ...base, mapsUrl: "javascript:x", venue: "" }), null);
});

test("a cancelled Event's ticket has no QR and no PDF", () => {
  const view = ticketView(parseTicket(answer({ state: "event_cancelled", qrUrl: "", pdfUrl: "" })), CORE, new Date());
  assert.equal(view.qrSrc, null);
  assert.equal(view.pdfHref, null);
  assert.equal(view.openFace, "front");
  const active = ticketView(parseTicket(answer()), CORE, new Date("2026-12-12T08:00:00Z"));
  assert.equal(active.qrSrc, `${CORE}/v1/public/tickets/${KEY}/qr.png`);
  assert.equal(active.openFace, "back");
  assert.equal(active.organizer, "AILAB");
  assert.equal(ticketView(parseTicket(answer({ ownerTeam: "YK" })), CORE, new Date()).organizer, "SKY LAB");
});

// next.config.ts imports next/constants, which Node's ESM loader cannot resolve
// outside Next, so the rule is read from the file.
test("/bilet answers with no Referer and out of search results", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  const rule = config.match(/source:\s*"\/bilet\/:path\*",\s*headers:\s*\[([^\]]*)\]/);
  assert.ok(rule, "a headers() rule for /bilet/:path*");
  assert.match(rule[1], /\{ key: "Referrer-Policy", value: "no-referrer" \}/);
  assert.match(rule[1], /\{ key: "X-Robots-Tag", value: "noindex, nofollow" \}/);
});
