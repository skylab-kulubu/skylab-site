import assert from "node:assert/strict";
import { test } from "node:test";

import {
  atDoorHours,
  checkInLine,
  checkInsLookupUrl,
  firstName,
  inToday,
  lookupFromStatus,
  newCheckIn,
  nextDelay,
  parseCheckIns,
  POLL_MS,
} from "../src/lib/ticket-check-ins.ts";
import { findCheckIns, openingFace } from "../src/lib/ticket-page.ts";

const KEY = "K7M2QXZFABCDEFGHJKLMNPQRST";
const CORE = "https://sandbox-api.yildizskylab.com";
const start = "2026-12-12T07:00:00Z"; // 10.00 in Istanbul
const end = "2026-12-12T15:00:00Z";

test("core's answer is read defensively", () => {
  assert.deepEqual(parseCheckIns({ checkIns: [{ session: " Açılış ", at: "2026-12-12T07:05:00Z" }] }), [
    { session: "Açılış", at: "2026-12-12T07:05:00Z" },
  ]);
  assert.deepEqual(parseCheckIns({ checkIns: [] }), []);
  assert.deepEqual(parseCheckIns({ checkIns: [{ session: "x", at: "nope" }, null, { at: "2026-12-12T07:05:00Z" }] }), [
    { session: "", at: "2026-12-12T07:05:00Z" },
  ]);
  assert.equal(parseCheckIns(null), null);
  assert.equal(parseCheckIns({}), null);
  assert.equal(checkInsLookupUrl(CORE, KEY), `${CORE}/v1/public/tickets/${KEY}/check-ins`);
});

test("the page asks only in the door's hours of an active Event", () => {
  const ticket = { state: "active", eventStart: start, eventEnd: end };
  assert.equal(atDoorHours(ticket, new Date("2026-12-12T03:59:00Z")), false);
  assert.equal(atDoorHours(ticket, new Date("2026-12-12T04:00:00Z")), true);
  assert.equal(atDoorHours(ticket, new Date("2026-12-12T15:00:00Z")), true);
  assert.equal(atDoorHours(ticket, new Date("2026-12-12T15:00:01Z")), false);
  assert.equal(atDoorHours({ ...ticket, state: "ended" }, new Date("2026-12-12T08:00:00Z")), false);
  assert.equal(atDoorHours({ ...ticket, state: "event_cancelled" }, new Date("2026-12-12T08:00:00Z")), false);
  assert.equal(atDoorHours({ ...ticket, eventStart: null }, new Date("2026-12-12T08:00:00Z")), false);
  // No end: a day after the start (ADR 0066).
  assert.equal(atDoorHours({ ...ticket, eventEnd: null }, new Date("2026-12-13T06:59:00Z")), true);
  // The card opens on its QR in the same hours.
  assert.equal(openingFace(ticket, new Date("2026-12-12T08:00:00Z")), "back");
  assert.equal(openingFace(ticket, new Date("2026-12-11T08:00:00Z")), "front");
});

test("a holder already in today is not asked about; a new check-in is the newest unseen", () => {
  const morning = { session: "Açılış", at: "2026-12-12T07:05:00Z" };
  const yesterday = { session: "Gün 1", at: "2026-12-11T07:05:00Z" };
  assert.equal(inToday([morning], new Date("2026-12-12T20:59:00Z")), true);
  assert.equal(inToday([morning], new Date("2026-12-12T21:00:00Z")), false); // midnight in Istanbul
  assert.equal(inToday([yesterday], new Date("2026-12-12T08:00:00Z")), false);

  const afternoon = { session: "Kapanış", at: "2026-12-12T12:00:00Z" };
  assert.equal(newCheckIn([], []), null);
  assert.equal(newCheckIn([yesterday], [yesterday]), null);
  assert.deepEqual(newCheckIn([yesterday], [yesterday, morning]), morning);
  assert.deepEqual(newCheckIn([], [morning, afternoon]), afternoon);
});

test("the greeting's words", () => {
  assert.equal(firstName("Elif Yılmaz"), "Elif");
  assert.equal(firstName("  "), "");
  assert.equal(checkInLine({ session: "Açılış", at: "2026-12-12T07:05:00Z" }), "Açılış · 10.05");
  assert.equal(checkInLine({ session: "", at: "2026-12-12T07:05:00Z" }), "10.05");
});

test("how long to wait: about 4 seconds, a minute after 429, doubling after failures", () => {
  assert.equal(nextDelay("ok", 0, () => 0), POLL_MS - 500);
  assert.equal(nextDelay("ok", 0, () => 1), POLL_MS + 500);
  assert.equal(nextDelay("limited", 0), 60_000);
  assert.equal(nextDelay("failed", 1), 8000);
  assert.equal(nextDelay("failed", 2), 16_000);
  assert.equal(nextDelay("failed", 10), 60_000);
});

test("core's statuses", () => {
  assert.deepEqual(lookupFromStatus(200, { checkIns: [] }), { kind: "ok", checkIns: [] });
  assert.deepEqual(lookupFromStatus(200, "x"), { kind: "failed" });
  assert.deepEqual(lookupFromStatus(404, null), { kind: "stop" });
  assert.deepEqual(lookupFromStatus(410, null), { kind: "stop" });
  assert.deepEqual(lookupFromStatus(429, null), { kind: "limited" });
  assert.deepEqual(lookupFromStatus(503, null), { kind: "failed" });
});

test("the site's server asks core with the visitor's address, never a malformed key", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ checkIns: [{ session: "Açılış", at: "2026-12-12T07:05:00Z" }] }), { status: 200 });
  };
  const result = await findCheckIns(KEY, CORE, {
    fetchImpl,
    visitor: "198.51.100.7",
    coreInternalUrl: "http://core:8080",
  });
  assert.deepEqual(result, { kind: "ok", checkIns: [{ session: "Açılış", at: "2026-12-12T07:05:00Z" }] });
  assert.equal(calls[0].url, `http://core:8080/v1/public/tickets/${KEY}/check-ins`);
  assert.equal(calls[0].init.cache, "no-store");
  assert.equal(calls[0].init.headers["X-Forwarded-For"], "198.51.100.7");

  assert.deepEqual(await findCheckIns("short", CORE, { fetchImpl }), { kind: "stop" });
  assert.equal(calls.length, 1);
  const status = (code) => async () => new Response(null, { status: code });
  assert.deepEqual(await findCheckIns(KEY, CORE, { fetchImpl: status(410) }), { kind: "stop" });
  assert.deepEqual(await findCheckIns(KEY, CORE, { fetchImpl: status(429) }), { kind: "limited" });
  const failing = async () => {
    throw new Error("down");
  };
  assert.deepEqual(await findCheckIns(KEY, CORE, { fetchImpl: failing }), { kind: "failed" });
});

test("the organizer's own logo: an event of the club's with one, else the team's, else none", async () => {
  const { organizerLogo } = await import("../src/lib/ticket-check-ins.ts");
  assert.equal(organizerLogo("WEBLAB", "Next.js Atölyesi")?.src, "/img/teams/weblablogobeyaz.svg");
  assert.equal(organizerLogo("weblab", "x")?.alt, "WEBLAB");
  assert.equal(organizerLogo("GECEKODU", "Gece Kodu #42")?.src, "/img/teams/gecekodubeyaz.png");
  assert.equal(organizerLogo("AIRLAB", "ARTLAB 2026")?.src, "/img/events/artlab.png");
  assert.equal(organizerLogo("SKY-SEC", "SKYDAYS '26")?.src, "/img/events/skydays.png");
  assert.equal(organizerLogo("GAMELAB", "YıldızJam")?.src, "/img/events/yildizjam.png");
  assert.equal(organizerLogo("YK", "SKY LAB Tanışma Günü"), null);
  assert.equal(organizerLogo("AILAB", "Yapay Zeka Kampı"), null);
});
