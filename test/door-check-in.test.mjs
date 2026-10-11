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

test("a dead QR asks for a new scan and locks the form", () => {
  for (const outcome of ["scan-required", "qr-invalid", "qr-expired", "qr-used-up"]) {
    assert.equal(needsNewScan(outcome), true, outcome);
    assert.equal(isFinal(outcome), true, outcome);
  }
  for (const outcome of ["checked-in", "already-checked-in", "session-closed"]) {
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
