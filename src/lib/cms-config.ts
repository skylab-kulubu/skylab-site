const baseUrl = (process.env.CMS_URL || "http://localhost:5000").replace(
  /\/+$/,
  "",
);
// Image uploads go through the site's own route, which forwards them to core
// /v1/media (see src/app/api/cms-media/route.ts).
const cdnUrl = "/api/cms-media";

export const cmsConfig = Object.freeze({
  baseUrl,
  cdnUrl,
  clientId: process.env.CMS_CLIENT_ID,
  globalSlug: "__global",
});
