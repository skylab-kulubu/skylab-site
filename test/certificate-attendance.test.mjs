import assert from "node:assert/strict";
import { test } from "node:test";

import { attendanceLine, ordinalSuffix, programDuration } from "../src/lib/certificate-attendance.ts";

test("the suffix follows how the number is read", () => {
  const table = {
    0: "'ı", 1: "'i", 2: "'si", 3: "'ü", 4: "'ü", 5: "'i", 6: "'sı", 7: "'si", 8: "'i", 9: "'u", 10: "'u",
    20: "'si", 30: "'u", 40: "'ı", 50: "'si", 60: "'ı", 70: "'i", 80: "'i", 90: "'ı", 100: "'ü", 1000: "'i",
    16: "'sı", 26: "'sı", 11: "'i", 23: "'ü", 34: "'ü", 45: "'i", 57: "'si", 68: "'i", 79: "'u",
    110: "'u", 120: "'si", 140: "'ı", 200: "'ü", 1005: "'i", 2000: "'i", 1_000_000: "'u", 1_000_000_000: "'ı",
  };
  for (const [n, suffix] of Object.entries(table)) {
    assert.equal(ordinalSuffix(Number(n)), suffix, `${n}`);
  }
});

test("the program length rounds to the nearest half hour, a tie up", () => {
  const table = {
    0: "", 45: "45 dakika", 59: "59 dakika", 60: "1 saat", 74: "1 saat", 75: "1,5 saat", 90: "1,5 saat",
    540: "9 saat", 550: "9 saat", 555: "9,5 saat", 560: "9,5 saat", 450: "7,5 saat",
  };
  for (const [minutes, text] of Object.entries(table)) {
    assert.equal(programDuration(Number(minutes)), text, `${minutes}`);
  }
  assert.equal(programDuration(-5), "");
  assert.equal(programDuration(Number.NaN), "");
});

test("the line reads the share and the program length", () => {
  assert.equal(attendanceLine({ attended: 6, total: 8, programMinutes: 540 }), "8 oturumdan 6'sı · 9 saat");
  assert.equal(attendanceLine({ attended: 4, total: 8, programMinutes: 345 }), "8 oturumdan 4'ü · 6 saat");
  assert.equal(attendanceLine({ attended: 1, total: 1, programMinutes: 45 }), "1 oturumdan 1'i · 45 dakika");
  // Sessions without times: no length.
  assert.equal(attendanceLine({ attended: 0, total: 3, programMinutes: 0 }), "3 oturumdan 0'ı");
});

test("no attendance, no line", () => {
  assert.equal(attendanceLine(undefined), null);
  assert.equal(attendanceLine(null), null);
  assert.equal(attendanceLine({}), null);
  assert.equal(attendanceLine({ attended: "6", total: 8, programMinutes: 540 }), null);
  assert.equal(attendanceLine({ attended: 6, total: -1, programMinutes: 540 }), null);
});
