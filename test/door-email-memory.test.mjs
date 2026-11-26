import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  EMAIL_MEMORY_DAYS,
  EMAIL_MEMORY_KEY,
  forgetEmail,
  pruneRememberedEmail,
  readRememberedEmail,
  rememberEmail,
  remembersEmail,
} from "../src/lib/door-email-memory.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 27, 8, 0, 0);

function memoryStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    items,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => void items.set(key, String(value)),
    removeItem: (key) => void items.delete(key),
  };
}

const blockedStorage = {
  getItem() {
    throw new Error("SecurityError");
  },
  setItem() {
    throw new Error("QuotaExceededError");
  },
  removeItem() {
    throw new Error("SecurityError");
  },
};

test("the key is versioned and the address is kept for a week", () => {
  assert.equal(EMAIL_MEMORY_KEY, "skylab.kapi.email.v1");
  assert.equal(EMAIL_MEMORY_DAYS, 7);
});

test("only a check-in core took is remembered", () => {
  assert.equal(remembersEmail("checked-in"), true);
  assert.equal(remembersEmail("already-checked-in"), true);
  for (const outcome of [
    "invalid-email",
    "no-ticket",
    "session-closed",
    "event-cancelled",
    "ticket-cancelled",
    "ticket-waitlisted",
    "scan-required",
    "qr-invalid",
    "qr-expired",
    "qr-used-up",
    "rate-limited",
    "unavailable",
    "network",
  ]) {
    assert.equal(remembersEmail(outcome), false, outcome);
  }
});

test("a remembered address is read back as it was typed, without blanks around it", () => {
  const storage = memoryStorage();
  rememberEmail(storage, "  Ayse.Yilmaz@std.yildiz.edu.tr ", NOW);
  assert.equal(readRememberedEmail(storage, NOW), "Ayse.Yilmaz@std.yildiz.edu.tr");
  // Only the address and the time it was saved are stored.
  assert.deepEqual(JSON.parse(storage.items.get(EMAIL_MEMORY_KEY)), {
    email: "Ayse.Yilmaz@std.yildiz.edu.tr",
    savedAt: NOW,
  });
  assert.deepEqual([...storage.items.keys()], [EMAIL_MEMORY_KEY]);
});

test("a new check-in replaces the address and starts the week again", () => {
  const storage = memoryStorage();
  rememberEmail(storage, "eski@ornek.com", NOW - 6 * DAY);
  rememberEmail(storage, "yeni@ornek.com", NOW);
  assert.equal(readRememberedEmail(storage, NOW + 6 * DAY), "yeni@ornek.com");
});

test("after seven days the address is gone, and pruning removes it", () => {
  const storage = memoryStorage();
  rememberEmail(storage, "ali@ornek.com", NOW);
  assert.equal(readRememberedEmail(storage, NOW + 7 * DAY - 1), "ali@ornek.com");
  assert.equal(readRememberedEmail(storage, NOW + 7 * DAY), null);
  pruneRememberedEmail(storage, NOW + 7 * DAY - 1);
  assert.equal(storage.items.has(EMAIL_MEMORY_KEY), true);
  pruneRememberedEmail(storage, NOW + 7 * DAY);
  assert.equal(storage.items.has(EMAIL_MEMORY_KEY), false);
});

test("a save dated after now (clock set back) is not trusted", () => {
  const storage = memoryStorage();
  rememberEmail(storage, "ali@ornek.com", NOW + DAY);
  assert.equal(readRememberedEmail(storage, NOW), null);
});

test("broken or foreign values read as nothing saved and are pruned", () => {
  for (const raw of [
    "ali@ornek.com",
    "{",
    "null",
    "[]",
    JSON.stringify({ email: "ali@ornek.com" }),
    JSON.stringify({ email: "not an address", savedAt: NOW }),
    JSON.stringify({ email: 42, savedAt: NOW }),
    JSON.stringify({ email: `${"a".repeat(250)}@b.co`, savedAt: NOW }),
    JSON.stringify({ email: "ali@ornek.com", savedAt: "dün" }),
  ]) {
    const storage = memoryStorage({ [EMAIL_MEMORY_KEY]: raw });
    assert.equal(readRememberedEmail(storage, NOW), null, raw);
    pruneRememberedEmail(storage, NOW);
    assert.equal(storage.items.has(EMAIL_MEMORY_KEY), false, raw);
  }
});

test("an address that does not look like one is not saved", () => {
  const storage = memoryStorage();
  rememberEmail(storage, "", NOW);
  rememberEmail(storage, "   ", NOW);
  rememberEmail(storage, "ali", NOW);
  rememberEmail(storage, "ali @ornek.com", NOW);
  assert.equal(storage.items.size, 0);
});

test("forgetting removes the address and leaves other keys alone", () => {
  const storage = memoryStorage({ "skylab-cms-hidden": "1" });
  rememberEmail(storage, "ali@ornek.com", NOW);
  forgetEmail(storage);
  assert.equal(readRememberedEmail(storage, NOW), null);
  assert.deepEqual([...storage.items.keys()], ["skylab-cms-hidden"]);
});

test("no storage, or a blocked one, means nothing remembered and no error", () => {
  for (const storage of [null, blockedStorage]) {
    assert.equal(readRememberedEmail(storage, NOW), null);
    assert.doesNotThrow(() => rememberEmail(storage, "ali@ornek.com", NOW));
    assert.doesNotThrow(() => forgetEmail(storage));
    assert.doesNotThrow(() => pruneRememberedEmail(storage, NOW));
  }
});

// The component imports Next and React, which Node's loader does not run here,
// so its wiring is read from the file.
const component = readFileSync(new URL("../src/components/door/GuestCheckIn.tsx", import.meta.url), "utf8");

test("the door page reads the address only in the browser, after hydration", () => {
  assert.match(component, /useSyncExternalStore\(subscribeToEmail, rememberedEmailNow, noEmailOnServer\)/);
  assert.match(component, /const noEmailOnServer = \(\) => null;/);
  // localStorage is reached only through deviceStorage(), inside try/catch.
  assert.equal(component.match(/localStorage/g)?.length, 2);
  assert.match(component, /try \{\n\s+return window\.localStorage;\n\s+\} catch \{/);
});

test("the door page saves the address only after a check-in core took", () => {
  assert.match(component, /if \(remembersEmail\(next\.outcome\)\) \{\n\s+rememberEmail\(deviceStorage\(\), address, Date\.now\(\)\);/);
  assert.equal(component.match(/rememberEmail\(/g)?.length, 1);
});

test("only the guest's own tap forgets the address, never an answer from core", () => {
  assert.equal(component.match(/forgetEmail\(/g)?.length, 1);
  assert.match(component, /function forget\(\) \{\n\s+forgetEmail\(deviceStorage\(\)\);/);
  assert.match(component, /onClick=\{forget\}/);
});

test("the remembered address is offered whole, with a way to type another or forget it", () => {
  assert.match(component, /`\$\{remembered\} ile katıl`/);
  assert.match(component, /onClick=\{\(\) => void checkIn\(remembered\)\}/);
  assert.match(component, />\s*Başka e-posta\s*</);
  assert.match(component, />\s*Bu cihazda unut\s*</);
  // The form no longer claims the page stores nothing.
  assert.doesNotMatch(component, /adresi saklamaz/);
  assert.match(component, /bu cihazda \$\{EMAIL_MEMORY_DAYS\} gün hatırlanır/);
});

test("a no-ticket answer offers a likely spelling, which only fills the field", () => {
  assert.match(component, /result\?\.outcome === "no-ticket" && result\.email \? suggestEmailFix\(result\.email\) : null/);
  assert.match(component, /\{suggestion\} mu demek istediniz\?/);
  assert.match(component, /function takeSuggestion\(address: string\) \{\n\s+setEmail\(address\);/);
  // Taking the hint never sends anything by itself.
  assert.doesNotMatch(component.match(/function takeSuggestion[\s\S]*?\n {2}\}/)[0], /checkIn\(/);
});
