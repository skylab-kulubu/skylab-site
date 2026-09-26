// Where the site's CMS image bridge sends uploads: core's /v1/media.
//
// Core's origin comes from API_BASE_URL, which the image build sets for each
// environment (production api., sandbox sandbox-api.). An image built without
// it falls back to the CMS host's origin, which core shared until the CMS
// moved to its own domain.
export function coreMediaUrl(apiBaseUrl: string | undefined, cmsUrl: string): string {
  return `${new URL(apiBaseUrl || cmsUrl).origin}/v1/media`;
}
