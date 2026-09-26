import assert from "node:assert/strict";
import { test } from "node:test";

import { coreMediaUrl } from "../src/lib/core-media.ts";

test("uploads go to core's origin, whatever path API_BASE_URL carries", () => {
  assert.equal(
    coreMediaUrl("https://api.yildizskylab.com", "https://cms.yildizskylab.com"),
    "https://api.yildizskylab.com/v1/media",
  );
  assert.equal(
    coreMediaUrl("https://sandbox-api.yildizskylab.com/v1/", "https://cms.yildizskylab.com"),
    "https://sandbox-api.yildizskylab.com/v1/media",
  );
});

test("the CMS host still names core when API_BASE_URL is missing", () => {
  assert.equal(
    coreMediaUrl(undefined, "https://api.yildizskylab.com/api"),
    "https://api.yildizskylab.com/v1/media",
  );
  assert.equal(coreMediaUrl("", "http://localhost:5000"), "http://localhost:5000/v1/media");
});
