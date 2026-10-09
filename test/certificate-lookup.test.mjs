import assert from "node:assert/strict";
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
