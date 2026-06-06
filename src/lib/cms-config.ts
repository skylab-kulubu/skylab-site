const baseUrl = (process.env.CMS_URL || "http://localhost:5000").replace(
  /\/+$/,
  "",
);
const cdnUrl = process.env.CMS_CDN_URL
  ? process.env.CMS_CDN_URL.replace(/\/+$/, "")
  : null;

export const cmsConfig = Object.freeze({
  baseUrl,
  cdnUrl,
  clientId: process.env.CMS_CLIENT_ID,
  globalSlug: "__global",
});
