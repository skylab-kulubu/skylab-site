import assert from "node:assert/strict";
import { test } from "node:test";

import {
  certificatePdfPath,
  certificatePdfRewrite,
  corePdfUrl,
  fetchCertificatePdf,
  pdfFilename,
} from "../src/lib/certificate-pdf.ts";

const SERIAL = "0123456789ABCDEF0123456789ABCDEF";

test("the page links the PDF on the club's own address", () => {
  assert.equal(certificatePdfPath("0123456789abcdef0123456789abcdef"), `/sertifika/${SERIAL}.pdf`);
});

test("/sertifika/{serial}.pdf is served by the PDF route", () => {
  assert.equal(certificatePdfRewrite(`/sertifika/${SERIAL}.pdf`), `/sertifika/${SERIAL}/pdf`);
  assert.equal(certificatePdfRewrite("/sertifika/0123456789abcdef.pdf"), "/sertifika/0123456789abcdef/pdf");
  // Letters and digits in the wrong shape still reach the PDF route, which
  // answers 404 without asking core.
  assert.equal(certificatePdfRewrite("/sertifika/XYZ.pdf"), "/sertifika/XYZ/pdf");
  for (const path of [
    `/sertifika/${SERIAL}`,
    "/sertifika",
    "/sertifika/.pdf",
    `/sertifika/a/${SERIAL}.pdf`,
    `/bilet/${SERIAL}.pdf`,
    `/sertifika/${SERIAL}.pdf/x`,
    `/sertifika/${SERIAL}.PDF`,
    "/sertifika/..%2F..%2Fadmin.pdf",
    "/sertifika/%2E%2E.pdf",
    `/sertifika/${"A".repeat(65)}.pdf`,
  ]) {
    assert.equal(certificatePdfRewrite(path), null, path);
  }
});

test("the PDF comes from core's public PDF route", () => {
  assert.equal(
    corePdfUrl("https://sandbox-api.yildizskylab.com/v1/", "0123456789abcdef"),
    "https://sandbox-api.yildizskylab.com/v1/certificates/verify/0123456789ABCDEF/pdf",
  );
  assert.equal(corePdfUrl(undefined, SERIAL), `https://api.yildizskylab.com/v1/certificates/verify/${SERIAL}/pdf`);
});

test("the file is named after the serial", () => {
  assert.equal(pdfFilename("0123456789abcdef"), "SKYLAB-sertifika-0123456789ABCDEF.pdf");
});

function recorder(response) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    if (response instanceof Error) throw response;
    return response;
  };
  return { calls, fetchImpl };
}

const pdfBytes = new TextEncoder().encode("%PDF-1.7 test");

test("a valid certificate's PDF is streamed inline with the site's headers", async () => {
  const { calls, fetchImpl } = recorder(
    new Response(pdfBytes, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Length": "13" } }),
  );
  const res = await fetchCertificatePdf(SERIAL.toLowerCase(), "https://api.yildizskylab.com", {
    fetchImpl,
    visitor: "203.0.113.9",
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `https://api.yildizskylab.com/v1/certificates/verify/${SERIAL}/pdf`);
  assert.equal(calls[0].init.cache, "no-store");
  assert.equal(calls[0].init.headers["X-Forwarded-For"], "203.0.113.9");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/pdf");
  assert.equal(res.headers.get("content-disposition"), `inline; filename="SKYLAB-sertifika-${SERIAL}.pdf"`);
  assert.equal(res.headers.get("content-length"), "13");
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(res.headers.get("referrer-policy"), "no-referrer");
  assert.deepEqual(new Uint8Array(await res.arrayBuffer()), pdfBytes);
});

test("core's own caching headers win over the default", async () => {
  const { fetchImpl } = recorder(
    new Response(pdfBytes, {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Cache-Control": "private, max-age=0, must-revalidate", ETag: '"v1"' },
    }),
  );
  const res = await fetchCertificatePdf(SERIAL, undefined, { fetchImpl });
  assert.equal(res.headers.get("cache-control"), "private, max-age=0, must-revalidate");
  assert.equal(res.headers.get("etag"), '"v1"');
});

test("the internal core address is used when set, the public one otherwise", async () => {
  const internal = recorder(new Response(pdfBytes, { headers: { "Content-Type": "application/pdf" } }));
  await fetchCertificatePdf(SERIAL, "https://api.yildizskylab.com", {
    fetchImpl: internal.fetchImpl,
    coreInternalUrl: "http://sky-lab-production-core-8qn0in:8080",
  });
  assert.equal(internal.calls[0].url, `http://sky-lab-production-core-8qn0in:8080/v1/certificates/verify/${SERIAL}/pdf`);
  const noVisitor = recorder(new Response(pdfBytes, { headers: { "Content-Type": "application/pdf" } }));
  await fetchCertificatePdf(SERIAL, "https://api.yildizskylab.com", { fetchImpl: noVisitor.fetchImpl });
  assert.equal(noVisitor.calls[0].init.headers, undefined);
});

test("a serial in the wrong shape is 404 without asking core", async () => {
  for (const serial of ["..%2F..%2Fadmin", "../../v1/admin", "0123", `${SERIAL}0`, "XYZ3456789ABCDEF", ""]) {
    const { calls, fetchImpl } = recorder(new Response(pdfBytes));
    const res = await fetchCertificatePdf(serial, undefined, { fetchImpl });
    assert.equal(res.status, 404, serial);
    assert.equal(calls.length, 0, serial);
    assert.equal(res.headers.get("cache-control"), "no-store");
  }
});

test("core's 404, 410 and 429 pass through as they are", async () => {
  for (const status of [404, 410, 429]) {
    const body = JSON.stringify({ title: "Not Found", status });
    const { fetchImpl } = recorder(
      new Response(body, {
        status,
        headers: { "Content-Type": "application/problem+json", ...(status === 429 ? { "Retry-After": "30" } : {}) },
      }),
    );
    const res = await fetchCertificatePdf(SERIAL, undefined, { fetchImpl });
    assert.equal(res.status, status);
    assert.equal(res.headers.get("content-type"), "application/problem+json");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("content-disposition"), null);
    assert.equal(res.headers.get("retry-after"), status === 429 ? "30" : null);
    assert.equal(await res.text(), body);
  }
});

test("core down, failing or answering something else is 502", async () => {
  for (const upstream of [
    new Error("connect ECONNREFUSED"),
    new Response("oops", { status: 500 }),
    new Response("oops", { status: 503 }),
    new Response("<html>", { status: 200, headers: { "Content-Type": "text/html" } }),
  ]) {
    const { fetchImpl } = recorder(upstream);
    const res = await fetchCertificatePdf(SERIAL, undefined, { fetchImpl });
    assert.equal(res.status, 502);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("content-disposition"), null);
  }
});
