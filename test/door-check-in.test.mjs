import assert from "node:assert/strict";
import { test } from "node:test";

import {
  coreApiBase,
  doorTokenFrom,
  guestCheckInUrl,
  isFinal,
  isSessionId,
  messageFor,
  needsNewScan,
  outcomeFor,
  presentationFor,
  retryAfterSeconds,
} from "../src/lib/door-check-in.ts";

test("only a UUID is a Session id", () => {
  assert.equal(isSessionId("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"), true);
  assert.equal(isSessionId("3F2B8C1E-9A4D-4E6F-8B7A-1C2D3E4F5A6B"), true);
  assert.equal(isSessionId("3f2b8c1e"), false);
  assert.equal(isSessionId("../v1/me"), false);
  assert.equal(isSessionId(""), false);
});

test("the door token is taken as it is, only blanks around it dropped", () => {
  assert.equal(doorTokenFrom("v1.t3kq8g.AbCdEfGh.0123456789abcdef"), "v1.t3kq8g.AbCdEfGh.0123456789abcdef");
  assert.equal(doorTokenFrom(" v1.a.b.c "), "v1.a.b.c");
  assert.equal(doorTokenFrom(["v1.first", "v1.second"]), "v1.first");
  assert.equal(doorTokenFrom(undefined), null);
  assert.equal(doorTokenFrom(""), null);
  assert.equal(doorTokenFrom("   "), null);
  assert.equal(doorTokenFrom([]), null);
});

test("the browser calls core's origin, or the sandbox proxy under next dev", () => {
  assert.equal(coreApiBase("production", "https://api.yildizskylab.com"), "https://api.yildizskylab.com");
  assert.equal(coreApiBase("production", "https://sandbox-api.yildizskylab.com/"), "https://sandbox-api.yildizskylab.com");
  assert.equal(coreApiBase("development", "https://sandbox-api.yildizskylab.com"), "/sandbox-api");
  assert.equal(
    guestCheckInUrl("https://api.yildizskylab.com", "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"),
    "https://api.yildizskylab.com/v1/sessions/3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b/check-in/guest",
  );
});

test("each answer of core has its own outcome", () => {
  assert.equal(outcomeFor(201), "checked-in");
  assert.equal(outcomeFor(409), "already-checked-in");
  assert.equal(outcomeFor(400), "invalid-email");
  assert.equal(outcomeFor(404), "no-ticket");
  assert.equal(outcomeFor(429, "guest_check_in_rate_limited"), "rate-limited");
  assert.equal(outcomeFor(403, "session_closed"), "session-closed");
  assert.equal(outcomeFor(403, "door_qr_required"), "scan-required");
  assert.equal(outcomeFor(403, "door_qr_invalid"), "qr-invalid");
  assert.equal(outcomeFor(403, "door_qr_expired"), "qr-expired");
  assert.equal(outcomeFor(403, "door_qr_used_up"), "qr-used-up");
  assert.equal(outcomeFor(403), "unavailable");
  assert.equal(outcomeFor(403, "something_new"), "unavailable");
  assert.equal(outcomeFor(500), "unavailable");
  assert.equal(outcomeFor(502), "unavailable");
});

// core answers a cancelled or waitlisted Ticket at the door with 409 too
// (ticket/status.go inactiveErr, handlers/tickets.go ticketError): the code,
// not the status, tells it from an earlier check-in.
test("a refused Ticket is not taken for an earlier check-in", () => {
  assert.equal(outcomeFor(409, "ticket_cancelled"), "ticket-cancelled");
  assert.equal(outcomeFor(409, "ticket_waitlisted"), "ticket-waitlisted");
  assert.equal(outcomeFor(409, "already_checked_in"), "already-checked-in");
  assert.equal(outcomeFor(409, "already_entered"), "already-checked-in");
  assert.equal(outcomeFor(409, "something_new"), "unavailable");
  assert.equal(outcomeFor(409, "conflict"), "unavailable");
});

test("the code picks the answer whatever the status", () => {
  assert.equal(outcomeFor(400, "email_or_ticket_key_required"), "invalid-email");
  assert.equal(outcomeFor(400, "invalid_body"), "unavailable");
  assert.equal(outcomeFor(400, "invalid_id"), "unavailable");
  assert.equal(outcomeFor(404, "guest_ticket_not_found"), "no-ticket");
  assert.equal(outcomeFor(429, "rate_limited"), "rate-limited");
  assert.equal(outcomeFor(429), "rate-limited");
});

test("only an answer without a code of its own falls back to the status", () => {
  assert.equal(outcomeFor(409, null), "already-checked-in");
  assert.equal(outcomeFor(400, null), "invalid-email");
  assert.equal(outcomeFor(404, null), "no-ticket");
  assert.equal(outcomeFor(404, "not_found"), "no-ticket");
  assert.equal(outcomeFor(400, "bad_request"), "invalid-email");
  assert.equal(outcomeFor(403, "forbidden"), "unavailable");
  assert.equal(outcomeFor(401, "unauthorized"), "unavailable");
  assert.equal(outcomeFor(500, "internal_error"), "unavailable");
});

test("a refused Ticket locks the form and does not blame the e-mail", () => {
  for (const outcome of ["ticket-cancelled", "ticket-waitlisted"]) {
    assert.equal(isFinal(outcome), true, outcome);
    assert.equal(needsNewScan(outcome), false, outcome);
    assert.equal(presentationFor(outcome).blamesEmail, false, outcome);
    assert.equal(messageFor(outcome).tone, "error", outcome);
  }
  assert.match(messageFor("ticket-cancelled").title, /iptal/);
  assert.match(messageFor("ticket-waitlisted").title, /bekleme listesinde/);
});

test("a closed session says why when core gives the Event's status as the reason", () => {
  assert.equal(outcomeFor(403, "session_closed", "event_cancelled"), "event-cancelled");
  assert.equal(outcomeFor(403, "session_closed", "event_not_published"), "event-not-published");
  assert.equal(outcomeFor(403, "session_closed", null), "session-closed");
  assert.equal(outcomeFor(403, "session_closed", "something_new"), "session-closed");
  assert.equal(outcomeFor(403, "door_qr_expired", "event_cancelled"), "qr-expired");
  assert.match(messageFor("event-cancelled").title, /iptal edildi/);
  assert.match(messageFor("event-not-published").title, /yayımlanmadı/);
  assert.equal(messageFor("session-closed").title, "Bu oturum şu an giriş almıyor");
});

test("a dead QR asks for a new scan and locks the form", () => {
  for (const outcome of ["scan-required", "qr-invalid", "qr-expired", "qr-used-up"]) {
    assert.equal(needsNewScan(outcome), true, outcome);
    assert.equal(isFinal(outcome), true, outcome);
  }
  for (const outcome of ["checked-in", "already-checked-in", "session-closed", "event-cancelled", "event-not-published"]) {
    assert.equal(needsNewScan(outcome), false, outcome);
    assert.equal(isFinal(outcome), true, outcome);
  }
  for (const outcome of ["invalid-email", "no-ticket", "rate-limited", "unavailable", "network"]) {
    assert.equal(isFinal(outcome), false, outcome);
  }
});

test("Retry-After is read when the browser can see it", () => {
  assert.equal(retryAfterSeconds("42"), 42);
  assert.equal(retryAfterSeconds("1.2"), 2);
  assert.equal(retryAfterSeconds(null), null);
  assert.equal(retryAfterSeconds("0"), null);
  assert.equal(retryAfterSeconds("Wed, 21 Oct 2026 07:28:00 GMT"), null);
  assert.match(messageFor("rate-limited", 42).detail, /42 saniye/);
  assert.match(messageFor("rate-limited", null).detail, /Bir dakika/);
});

test("every outcome has a Turkish message", () => {
  const outcomes = [
    "checked-in",
    "already-checked-in",
    "invalid-email",
    "no-ticket",
    "session-closed",
    "event-cancelled",
    "event-not-published",
    "ticket-cancelled",
    "ticket-waitlisted",
    "scan-required",
    "qr-invalid",
    "qr-expired",
    "qr-used-up",
    "rate-limited",
    "unavailable",
    "network",
  ];
  const titles = new Set();
  for (const outcome of outcomes) {
    const message = messageFor(outcome);
    assert.ok(message.title && message.detail, outcome);
    titles.add(message.title);
  }
  assert.equal(titles.size, outcomes.length);
  assert.equal(messageFor("checked-in").tone, "success");
});

const ALL_OUTCOMES = [
  "checked-in",
  "already-checked-in",
  "invalid-email",
  "no-ticket",
  "session-closed",
  "ticket-cancelled",
  "ticket-waitlisted",
  "scan-required",
  "qr-invalid",
  "qr-expired",
  "qr-used-up",
  "rate-limited",
  "unavailable",
  "network",
];

test("a final answer replaces the form, any other one sits above it", () => {
  for (const outcome of ALL_OUTCOMES) {
    assert.equal(presentationFor(outcome).replacesForm, isFinal(outcome), outcome);
  }
});

test("each outcome has its tone and its icon, so it is not told by colour alone", () => {
  const tones = new Set(["success", "info", "warning", "danger"]);
  const icons = new Set(["check", "info", "scan", "wait", "offline", "alert"]);
  for (const outcome of ALL_OUTCOMES) {
    const view = presentationFor(outcome);
    assert.ok(tones.has(view.tone), outcome);
    assert.ok(icons.has(view.icon), outcome);
  }
  assert.deepEqual(presentationFor("checked-in"), { tone: "success", icon: "check", replacesForm: true, blamesEmail: false });
  assert.equal(presentationFor("already-checked-in").tone, "info");
  for (const outcome of ["scan-required", "qr-invalid", "qr-expired", "qr-used-up"]) {
    assert.equal(presentationFor(outcome).icon, "scan", outcome);
  }
  assert.equal(presentationFor("rate-limited").icon, "wait");
  assert.equal(presentationFor("network").icon, "offline");
});

test("only the answers about the address mark the e-mail field wrong", () => {
  const blamed = ALL_OUTCOMES.filter((outcome) => presentationFor(outcome).blamesEmail);
  assert.deepEqual(blamed, ["invalid-email", "no-ticket"]);
});

test("a success or an informational answer is announced politely, the rest as alerts", () => {
  assert.equal(presentationFor("checked-in").tone === "success" && messageFor("checked-in").tone, "success");
  for (const outcome of ALL_OUTCOMES) {
    const polite = presentationFor(outcome).tone === "success" || presentationFor(outcome).tone === "info";
    assert.equal(polite, messageFor(outcome).tone !== "error", outcome);
  }
});

test("no ticket for the address: it is repeated and the guest is sent to the door staff", () => {
  const message = messageFor("no-ticket", null, " ayse@gmial.com ");
  assert.equal(message.title, "Bu e-postayla kayıt yok");
  assert.match(message.detail, /^ayse@gmial\.com ile bu etkinliğe kayıt bulunamadı\./);
  assert.match(message.detail, /Kapıdaki görevliye adınızı söyleyin; kaydınızı orada yapsın\./);
  assert.doesNotMatch(message.detail, /https?:|form/i);
  assert.match(messageFor("no-ticket").detail, /^Bu e-posta adresi ile/);
});
