import assert from "node:assert/strict";
import { test } from "node:test";

import { serialFromInput } from "../src/lib/certificate-serial.ts";

const SERIAL = "5E1A9102C0FFEE7B3D44A1F09C2E6B71";

test("a typed serial is taken as is, in capitals", () => {
  assert.equal(serialFromInput(SERIAL), SERIAL);
  assert.equal(serialFromInput(` ${SERIAL.toLowerCase()} `), SERIAL);
  assert.equal(serialFromInput("0123456789abcdef"), "0123456789ABCDEF");
});

test("spaces and dashes in a copied serial are dropped", () => {
  assert.equal(serialFromInput("5E1A 9102 C0FF EE7B 3D44 A1F0 9C2E 6B71"), SERIAL);
  assert.equal(serialFromInput("5E1A-9102-C0FF-EE7B-3D44-A1F0-9C2E-6B71"), SERIAL);
});

test("a pasted certificate link gives its serial", () => {
  assert.equal(serialFromInput(`https://skyl.app/c/${SERIAL}`), SERIAL);
  assert.equal(serialFromInput(`https://yildizskylab.com/sertifika/${SERIAL}/`), SERIAL);
  assert.equal(serialFromInput(`yildizskylab.com/sertifika/${SERIAL}?utm=x`), SERIAL);
});

test("anything else is no serial", () => {
  for (const input of ["", "   ", "SKY-26-1001", SERIAL.slice(1), `${SERIAL}0`, "G".repeat(32), "../etc/passwd", "https://skyl.app/c/"]) {
    assert.equal(serialFromInput(input), null, input);
  }
});
