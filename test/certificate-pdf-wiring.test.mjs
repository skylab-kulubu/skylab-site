import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The middleware and the page import Next, which Node's loader cannot resolve
// outside Next, so the wiring is read from the files.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the middleware rewrites /sertifika/{serial}.pdf to the PDF route", () => {
  const middleware = read("src/middleware.ts");
  assert.match(middleware, /certificatePdfRewrite\(req\.nextUrl\.pathname\)/);
  assert.match(middleware, /NextResponse\.rewrite\(/);
});

test("the PDF route asks core with the visitor's address", () => {
  const route = read("src/app/sertifika/[serial]/pdf/route.ts");
  assert.match(route, /export async function GET/);
  assert.match(route, /fetchCertificatePdf\(/);
  assert.match(route, /visitorAddress\(/);
  assert.match(route, /CORE_INTERNAL_URL/);
});

test("the verification page links the PDF on the club's own address", () => {
  const page = read("src/app/sertifika/[serial]/page.tsx");
  assert.match(page, /certificatePdfPath\(certificate\.serial\)/);
  assert.doesNotMatch(page, /href=\{certificate\.pdfUrl\}/);
});
