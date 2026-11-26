// The door page (/kapi/[sessionId]) remembers, on the guest's own device, the
// e-mail their last check-in went through, so the next scan is one tap.
//
// Only the address and when it was saved are kept, under one versioned key in
// localStorage, for a week. Nothing here reaches core or anywhere else: the
// address leaves the device only in the check-in the guest taps. A read that
// finds an old, broken or foreign value treats it as nothing saved.

import type { CheckInOutcome } from "./door-check-in.ts";

export const EMAIL_MEMORY_KEY = "skylab.kapi.email.v1";
export const EMAIL_MEMORY_DAYS = 7;
const EMAIL_MEMORY_MS = EMAIL_MEMORY_DAYS * 24 * 60 * 60 * 1000;

// The part of the Web Storage API this file uses; tests hand in a Map-backed one.
export type EmailStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type Saved = { email: string; savedAt: number };

// Only an answer that took the address as the guest's is worth remembering:
// a new check-in, or one core already had.
export function remembersEmail(outcome: CheckInOutcome): boolean {
  return outcome === "checked-in" || outcome === "already-checked-in";
}

function looksLikeEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(value);
}

function parse(raw: string | null): Saved | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Saved> | null;
    if (!value || !looksLikeEmail(value.email)) return null;
    if (typeof value.savedAt !== "number" || !Number.isFinite(value.savedAt)) return null;
    return { email: value.email, savedAt: value.savedAt };
  } catch {
    return null;
  }
}

function fresh(saved: Saved | null, now: number): saved is Saved {
  // A save dated in the future (a clock set back) counts as stale too.
  return saved !== null && saved.savedAt <= now && now - saved.savedAt < EMAIL_MEMORY_MS;
}

// The remembered address, or null: none, expired, unreadable, or storage blocked.
export function readRememberedEmail(storage: EmailStorage | null, now: number): string | null {
  if (!storage) return null;
  try {
    const saved = parse(storage.getItem(EMAIL_MEMORY_KEY));
    return fresh(saved, now) ? saved.email : null;
  } catch {
    return null;
  }
}

// Saves the address a check-in just went through; a later one replaces it and
// starts the week again. A blocked or full storage just keeps nothing.
export function rememberEmail(storage: EmailStorage | null, email: string, now: number): void {
  const value = email.trim();
  if (!storage || !looksLikeEmail(value)) return;
  try {
    storage.setItem(EMAIL_MEMORY_KEY, JSON.stringify({ email: value, savedAt: now } satisfies Saved));
  } catch {
    // Nothing to do: the next scan shows the form.
  }
}

export function forgetEmail(storage: EmailStorage | null): void {
  if (!storage) return;
  try {
    storage.removeItem(EMAIL_MEMORY_KEY);
  } catch {
    // Nothing to do: there is nothing readable left either way.
  }
}

// Drops a value that can no longer be read back as an address, so an expired
// one does not stay on the device past its week.
export function pruneRememberedEmail(storage: EmailStorage | null, now: number): void {
  if (!storage) return;
  try {
    const raw = storage.getItem(EMAIL_MEMORY_KEY);
    if (raw !== null && !fresh(parse(raw), now)) storage.removeItem(EMAIL_MEMORY_KEY);
  } catch {
    // Nothing to do.
  }
}
