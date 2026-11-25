// A certificate's PDF on the club's own address: /sertifika/{serial}.pdf
// (core-backend docs/certificate-pdf-address.md). The QR and the mail open the
// verification page, /sertifika/{serial}; its "PDF" button and core's pdfUrl
// open this one, which keeps the club's address the way Credly or Accredible
// keep theirs. The site's server reads core's public
// GET /v1/certificates/verify/{serial}/pdf and streams it on: core still
// decides, so a revoked certificate is 404 at once. core's old api. address
// keeps working for the mails already sent.
//
// No node: imports here: the middleware runs this file too.

import { SERIAL_PATTERN } from "./certificate-serial.ts";

const PRODUCTION_CORE = "https://api.yildizskylab.com";

// The PDF's address on this site, as the verification page links it.
export function certificatePdfPath(serial: string): string {
  return `/sertifika/${serial.toUpperCase()}.pdf`;
}

// The App Router has no route for "{serial}.pdf" beside the page's [serial],
// so the middleware rewrites /sertifika/{serial}.pdf to the PDF route,
// /sertifika/{serial}/pdf. Only letters and digits are rewritten (nothing
// that could be read as a path); anything else stays the page's.
const PDF_ADDRESS = /^\/sertifika\/([A-Za-z0-9]{1,64})\.pdf$/;

export function certificatePdfRewrite(pathname: string): string | null {
  const match = PDF_ADDRESS.exec(pathname);
  return match ? `/sertifika/${match[1]}/pdf` : null;
}

export function corePdfUrl(coreApiOrigin: string | undefined, serial: string): string {
  const origin = new URL(coreApiOrigin || PRODUCTION_CORE).origin;
  return `${origin}/v1/certificates/verify/${serial.toUpperCase()}/pdf`;
}

export function pdfFilename(serial: string): string {
  return `SKYLAB-sertifika-${serial.toUpperCase()}.pdf`;
}

// As /sertifika (next.config.ts): out of search results, no Referer. The
// answer is never stored, so a revoked certificate's PDF is gone at once,
// unless core says how to cache it.
const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

// Core's refusals the visitor sees as they are: not found (or revoked),
// gone, too many requests.
const PASSED_THROUGH = new Set([404, 410, 429]);

function internalOrigin(coreInternalUrl: string | undefined): string | null {
  if (!coreInternalUrl?.trim()) return null;
  try {
    const url = new URL(coreInternalUrl.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

function copy(from: Headers, to: Headers, names: string[]) {
  for (const name of names) {
    const value = from.get(name);
    if (value) to.set(name, value);
  }
}

// The answer to /sertifika/{serial}.pdf. A serial that is not 16 or 32 hex
// characters is 404 without asking core. Core is asked as the ticket page
// asks it (src/lib/ticket-page.ts): over CORE_INTERNAL_URL when set, with
// the visitor's address as X-Forwarded-For, since core limits its public
// certificate routes per client. Nothing is logged.
export async function fetchCertificatePdf(
  serial: string,
  coreApiOrigin: string | undefined,
  {
    fetchImpl = fetch,
    visitor = null,
    coreInternalUrl,
  }: { fetchImpl?: typeof fetch; visitor?: string | null; coreInternalUrl?: string } = {},
): Promise<Response> {
  if (!SERIAL_PATTERN.test(serial)) return new Response(null, { status: 404, headers: BASE_HEADERS });

  let upstream: Response;
  try {
    upstream = await fetchImpl(corePdfUrl(internalOrigin(coreInternalUrl) ?? coreApiOrigin, serial), {
      cache: "no-store",
      ...(visitor ? { headers: { "X-Forwarded-For": visitor } } : {}),
    });
  } catch {
    return new Response(null, { status: 502, headers: BASE_HEADERS });
  }

  const headers = new Headers(BASE_HEADERS);
  if (PASSED_THROUGH.has(upstream.status)) {
    copy(upstream.headers, headers, ["content-type", "retry-after"]);
    return new Response(upstream.body, { status: upstream.status, headers });
  }
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !/^application\/pdf\b/i.test(type)) {
    await upstream.body?.cancel().catch(() => {});
    return new Response(null, { status: 502, headers: BASE_HEADERS });
  }
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${pdfFilename(serial)}"`);
  copy(upstream.headers, headers, ["content-length", "cache-control", "etag", "last-modified"]);
  return new Response(upstream.body, { status: 200, headers });
}
