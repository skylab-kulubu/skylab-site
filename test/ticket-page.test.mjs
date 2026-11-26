import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  ARTLAB_AMBER,
  ARTLAB_GROUND,
  artlabAccent,
  backWhen,
  cardColor,
  contrast,
  contrastWithWhite,
  coverUrl,
  findTicket,
  frontWhen,
  internalCoreOrigin,
  isTicketKey,
  mapsLink,
  themeKey,
  openingFace,
  organizerName,
  parseTicket,
  requestCancel,
  SKYLAB_PURPLE,
  ticketLookupUrl,
  ticketView,
  trustedUrl,
  visitorAddress,
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
  organizerName: "AILAB",
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
    assert.deepEqual(await findTicket(bad, CORE, { fetchImpl: counting }), { kind: "not-found" });
  }
  assert.equal(calls, 0);
});

test("core's answer decides the page's state", async () => {
  assert.equal((await findTicket(KEY, CORE, { fetchImpl: respond(200, answer()) })).kind, "found");
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: respond(404, { status: 404 }) }), { kind: "not-found" });
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: respond(410, { code: "ticket_page_closed" }) }), { kind: "closed" });
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: respond(500, { status: 500 }) }), { kind: "unavailable" });
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: respond(429, { status: 429 }) }), { kind: "unavailable" });
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: respond(200, { nothing: true }) }), { kind: "unavailable" });
  const offline = async () => {
    throw new TypeError("fetch failed");
  };
  assert.deepEqual(await findTicket(KEY, CORE, { fetchImpl: offline }), { kind: "unavailable" });
});

test("the lookup is never cached, asks the ticket's own address and names the visitor", async () => {
  const seen = [];
  const recording = async (url, init) => {
    seen.push({ url, cache: init?.cache, forwardedFor: new Headers(init?.headers).get("x-forwarded-for") });
    return new Response(JSON.stringify(answer()));
  };
  await findTicket(KEY, CORE, { fetchImpl: recording, visitor: "203.0.113.7" });
  await findTicket(KEY, CORE, { fetchImpl: recording });
  assert.deepEqual(seen, [
    { url: `${CORE}/v1/public/tickets/${KEY}`, cache: "no-store", forwardedFor: "203.0.113.7" },
    { url: `${CORE}/v1/public/tickets/${KEY}`, cache: "no-store", forwardedFor: null },
  ]);
});

test("with CORE_INTERNAL_URL the server asks core inside the network; the browser's links stay public", async () => {
  const internal = "http://sky-lab-sandbox-core-ljnbrl:8080";
  const seen = [];
  const recording = async (url, init) => {
    seen.push({ url, forwardedFor: new Headers(init?.headers).get("x-forwarded-for") });
    return new Response(JSON.stringify(answer({ qrUrl: `/v1/public/tickets/${KEY}/qr.png` })));
  };
  const result = await findTicket(KEY, CORE, { fetchImpl: recording, visitor: "203.0.113.7", coreInternalUrl: `${internal}/` });
  assert.deepEqual(seen, [{ url: `${internal}/v1/public/tickets/${KEY}`, forwardedFor: "203.0.113.7" }]);
  // A path from core is resolved against the public origin, never the internal one.
  assert.equal(ticketView(result.ticket, CORE, new Date()).qrSrc, `${CORE}/v1/public/tickets/${KEY}/qr.png`);
  for (const unset of [undefined, "", "  ", "not a url", "ftp://core:21"]) {
    seen.length = 0;
    await findTicket(KEY, CORE, { fetchImpl: recording, coreInternalUrl: unset });
    assert.equal(seen[0].url, `${CORE}/v1/public/tickets/${KEY}`, String(unset));
  }
  assert.equal(internalCoreOrigin("http://sky-lab-production-core-8qn0in:8080/v1"), "http://sky-lab-production-core-8qn0in:8080");
});

test("the visitor is the address the edge proxy appended, never one a client wrote first", () => {
  assert.equal(visitorAddress("203.0.113.7", null), "203.0.113.7");
  assert.equal(visitorAddress("198.51.100.1, 203.0.113.7", null), "203.0.113.7");
  assert.equal(visitorAddress("2001:db8::1", null), "2001:db8::1");
  assert.equal(visitorAddress(null, " 203.0.113.9 "), "203.0.113.9");
  assert.equal(visitorAddress("203.0.113.7, not-an-ip", null), null);
  assert.equal(visitorAddress("", ""), null);
  assert.equal(visitorAddress(null, null), null);
});

test("an answer is read only with a known state and a name", () => {
  assert.equal(parseTicket(answer({ state: "lost" })), null);
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
  assert.equal(cardColor([null, null], []), SKYLAB_PURPLE.toLowerCase());
  assert.equal(cardColor(["#26446E", "#7C3AED"], ["#d9c34a"]), "#26446e");
  assert.equal(cardColor([null, "#1F4E79"], ["#d9c34a"]), "#1f4e79");
  assert.equal(cardColor([null, null], ["#26446e"]), "#26446e");
  assert.equal(cardColor(["teal", "blue"], ["nope"]), SKYLAB_PURPLE.toLowerCase());
  for (const light of ["#ffffff", "#e0c8e5", "#d9c34a", "#7fffd4"]) {
    const color = cardColor([light], []);
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

test("a cover loads only from the club's media hosts or core", () => {
  const sandboxCdn = "https://sandbox-cdn.yildizskylab.com/media/kapak.jpg";
  assert.equal(coverUrl(sandboxCdn, CORE), sandboxCdn);
  assert.equal(coverUrl("https://cdn.yildizskylab.com/media/kapak.jpg", CORE), "https://cdn.yildizskylab.com/media/kapak.jpg");
  assert.equal(coverUrl(`${CORE}/v1/media/x`, CORE), `${CORE}/v1/media/x`);
  assert.equal(coverUrl("https://example.com/kapak.jpg", CORE), null);
  assert.equal(coverUrl("https://cdn.yildizskylab.com.example.com/k.jpg", CORE), null);
  assert.equal(coverUrl("http://cdn.yildizskylab.com/k.jpg", CORE), null);
  const view = ticketView(parseTicket(answer({ coverImageUrl: "https://example.com/k.jpg" })), CORE, new Date());
  assert.equal(view.coverSrc, null);
});

test("theme.accent is read as the ticket's colour", () => {
  assert.equal(parseTicket(answer({ theme: { key: "kurumsal", accent: "#26446E" } })).themeAccent, "#26446E");
  assert.equal(parseTicket(answer({ theme: null })).themeAccent, null);
  assert.equal(ticketView(parseTicket(answer({ theme: { accent: "#26446e" } })), CORE, new Date()).color, "#26446e");
});

test("theme.key: artlab is ARTLAB's look, anything else or none (an older core) Kurumsal", () => {
  assert.equal(parseTicket(answer({ theme: { key: "artlab", accent: "#8B5CF6" } })).theme, "artlab");
  assert.equal(parseTicket(answer({ theme: { key: " ARTLAB " } })).theme, "artlab");
  assert.equal(parseTicket(answer()).theme, "kurumsal");
  for (const theme of [undefined, null, {}, { key: "" }, { key: "neon" }, { key: 3 }, "artlab"]) {
    assert.equal(themeKey(theme), "kurumsal", JSON.stringify(theme));
  }
});

test("a Kurumsal ticket keeps today's colour order: ticketAccentColor, theme.accent, the cover, the purple", () => {
  const at = new Date("2026-12-12T08:00:00Z");
  const view = (extra) => ticketView(parseTicket(answer(extra)), CORE, at);
  assert.equal(view({ ticketAccentColor: "#26446E", theme: { key: "kurumsal", accent: "#1F4E79" } }).color, "#26446e");
  assert.equal(view({ theme: { key: "kurumsal", accent: "#1F4E79" }, coverColors: ["#0F766E"] }).color, "#1f4e79");
  assert.equal(view({ theme: { key: "kurumsal" }, coverColors: ["#0F766E"] }).color, "#0f766e");
  assert.equal(view({ theme: undefined }).color, SKYLAB_PURPLE.toLowerCase());
  assert.equal(view({}).theme, "kurumsal");
});

test("an ARTLAB ticket: ticketAccentColor, else ARTLAB's amber, never the cover's colour or core's Kurumsal accent", () => {
  const at = new Date("2026-12-12T08:00:00Z");
  const view = (extra) => ticketView(parseTicket(answer({ coverColors: ["#0F766E"], ...extra })), CORE, at);
  assert.equal(view({ theme: { key: "artlab", accent: "#0F766E" } }).color, ARTLAB_AMBER.toLowerCase());
  assert.equal(view({ theme: { key: "artlab" }, ticketAccentColor: "#3ED6F0" }).color, "#3ed6f0");
  assert.equal(view({ theme: { key: "artlab" }, ticketAccentColor: "cyan" }).color, ARTLAB_AMBER.toLowerCase());
  assert.equal(view({ theme: { key: "artlab" } }).theme, "artlab");
});

test("ARTLAB's accent is readable on its dark ground (WCAG AA 4.5:1), a dark ticket colour lightened", () => {
  assert.ok(contrast(ARTLAB_AMBER, ARTLAB_GROUND) >= 4.5);
  // the page's other ARTLAB colours: ink, second ink, cyan links (TicketCard.module.css)
  for (const ink of ["#e9edf2", "#8a95a5", "#3ed6f0"]) assert.ok(contrast(ink, ARTLAB_GROUND) >= 4.5, ink);
  for (const dark of ["#000000", "#26446e", "#7c3aed", "#0b0e13"]) {
    const color = artlabAccent(dark);
    assert.ok(contrast(color, ARTLAB_GROUND) >= 4.5, `${dark} → ${color}`);
  }
  assert.equal(artlabAccent(null), ARTLAB_AMBER.toLowerCase());
  assert.equal(contrast("#ffffff", "#000000"), 21);
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
  const club = "SKY LAB: Bilgisayar Bilimleri Kulübü";
  assert.equal(ticketView(parseTicket(answer({ ownerTeam: "YK", organizerName: club })), CORE, new Date()).organizer, club);
});

test("the organizer is core's organizerName, else the club for its boards", () => {
  const club = "SKY LAB: Bilgisayar Bilimleri Kulübü";
  assert.equal(organizerName(club, "YK"), club);
  assert.equal(organizerName("WEBLAB", "WEBLAB"), "WEBLAB");
  for (const team of ["YK", "DK", "ADMIN", "yk", "", "  "]) assert.equal(organizerName("", team), club);
  assert.equal(organizerName("", " GECEKODU "), "GECEKODU");
  assert.equal(ticketView(parseTicket(answer({ ownerTeam: "YK", organizerName: undefined })), CORE, new Date()).organizer, club);
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

test("a cancelled ticket and one on the waiting list are read, with no QR and no PDF", () => {
  for (const state of ["ticket_cancelled", "waitlisted"]) {
    const ticket = parseTicket(answer({ state, qrUrl: "", pdfUrl: "" }));
    assert.equal(ticket.state, state);
    const view = ticketView(ticket, CORE, new Date("2026-12-12T08:00:00Z"));
    assert.equal(view.qrSrc, null, state);
    assert.equal(view.pdfHref, null, state);
    assert.equal(view.openFace, "front", state);
  }
  // Even if core sent the links, the page would not show them
  const sent = ticketView(parseTicket(answer({ state: "waitlisted" })), CORE, new Date());
  assert.equal(sent.qrSrc, null);
});

test("cancellable is true only when core says so", () => {
  assert.equal(parseTicket(answer()).cancellable, false);
  assert.equal(parseTicket(answer({ cancellable: "true" })).cancellable, false);
  assert.equal(parseTicket(answer({ cancellable: true })).cancellable, true);
});

test("the cancel posts core's route from the server, with the visitor's address", async () => {
  let asked;
  const fetchImpl = async (url, init) => {
    asked = { url, init };
    return new Response(JSON.stringify({ state: "ticket_cancelled" }), { status: 200 });
  };
  assert.deepEqual(
    await requestCancel(KEY, CORE, { fetchImpl, visitor: "203.0.113.9", coreInternalUrl: "http://core:8080" }),
    { kind: "cancelled" },
  );
  assert.equal(asked.url, `http://core:8080/v1/public/tickets/${KEY}/cancel`);
  assert.equal(asked.init.method, "POST");
  assert.equal(asked.init.cache, "no-store");
  assert.deepEqual(asked.init.headers, { "X-Forwarded-For": "203.0.113.9" });
});

test("the cancel says why core refused it", async () => {
  const conflict = (code) => respond(409, { type: "about:blank", title: "Conflict", status: 409, code });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: conflict("ticket_cancel_closed") }), {
    kind: "refused",
    code: "ticket_cancel_closed",
  });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: conflict("ticket_checked_in") }), {
    kind: "refused",
    code: "ticket_checked_in",
  });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: conflict("something_new") }), { kind: "refused", code: null });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: respond(404) }), { kind: "not-found" });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: respond(429) }), { kind: "limited" });
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: respond(500) }), { kind: "failed" });
  const broken = async () => {
    throw new Error("down");
  };
  assert.deepEqual(await requestCancel(KEY, CORE, { fetchImpl: broken }), { kind: "failed" });
});

test("a malformed key is never posted to core", async () => {
  let calls = 0;
  const counting = async () => {
    calls++;
    return new Response("{}");
  };
  assert.deepEqual(await requestCancel("../../v1/x", CORE, { fetchImpl: counting }), { kind: "not-found" });
  assert.equal(calls, 0);
});
