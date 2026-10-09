// Where /sertifika/[serial] looks a certificate up: core's public
// GET /v1/public/certificates/{serial}.
//
// Core's origin is CORE_API_ORIGIN, which next.config.ts writes into the
// build from API_BASE_URL (production api., sandbox sandbox-api.), so the
// sandbox site asks sandbox core. An image built without it falls back to
// production core, as the page did before.
const PRODUCTION_CORE = "https://api.yildizskylab.com";

export function certificateLookupUrl(coreApiOrigin: string | undefined, serial: string): string {
  const origin = new URL(coreApiOrigin || PRODUCTION_CORE).origin;
  return `${origin}/v1/public/certificates/${serial.toUpperCase()}`;
}
