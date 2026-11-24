import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { certificateLookupUrl } from "../src/lib/certificate-lookup.ts";

test("the lookup goes to the core the image was built for", () => {
  assert.equal(
    certificateLookupUrl("https://sandbox-api.yildizskylab.com", "0123456789abcdef"),
    "https://sandbox-api.yildizskylab.com/v1/public/certificates/0123456789ABCDEF",
  );
  assert.equal(
    certificateLookupUrl("https://api.yildizskylab.com/v1/", "0123456789ABCDEF"),
    "https://api.yildizskylab.com/v1/public/certificates/0123456789ABCDEF",
  );
});

test("an image built without API_BASE_URL looks certificates up on production core", () => {
  for (const origin of [undefined, ""]) {
    assert.equal(
      certificateLookupUrl(origin, "0123456789abcdef0123456789abcdef"),
      "https://api.yildizskylab.com/v1/public/certificates/0123456789ABCDEF0123456789ABCDEF",
    );
  }
});

// next.config.ts imports next/constants, which Node's ESM loader cannot resolve
// outside Next, so the rule is read from the file.
test("/sertifika answers with no Referer and out of search results", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  const rule = config.match(/source:\s*"\/sertifika\/:path\*",\s*headers:\s*\[([^\]]*)\]/);
  assert.ok(rule, "a headers() rule for /sertifika/:path*");
  assert.match(rule[1], /\{ key: "Referrer-Policy", value: "no-referrer" \}/);
  assert.match(rule[1], /\{ key: "X-Robots-Tag", value: "noindex, nofollow" \}/);
});
