// Server entry on purpose: the "inscribed" root entry is a client module, and its
// createCmsConfig could not be called from the server code that imports this.
import { createCmsConfig } from "inscribed/page";

export const cmsConfig = createCmsConfig({
  baseUrl: process.env.CMS_URL || "https://sandbox-api.yildizskylab.com/api",
  // The site's Keycloak client is also its tenant on the CMS and the key for
  // tokenless reads of published content.
  clientKey: process.env.KEYCLOAK_CLIENT_ID || "frontend-main",
  // Image uploads go through the site's own route, which forwards them to core
  // /v1/media (see src/app/api/cms-media/route.ts).
  cdnUrl: "/api/cms-media",
  globalSlug: "__global",
  adminLocale: "tr",
  // The editing panel in the site's own palette and type.
  theme: {
    accent: "#a855f7",
    danger: "#ff6467",
    bg: "#09090b",
    surface: "#ffffff",
    text: "#fafafa",
    radius: 10,
    fontSans: "var(--font-manrope-sans), system-ui, sans-serif",
  },
});
