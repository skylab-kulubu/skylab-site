import { getServiceToken as originalGetToken } from "@skylab-kulubu/inscribed-auth/config";

export const getServiceToken = async () => {
  try {
    return await originalGetToken();
  } catch (err) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      `[cms-sync] Uyarı: Keycloak servis token'ı alınamadı, boş token ile devam ediliyor: ${err.message}`,
    );
    return "";
  }
};

export { onSyncError } from "@skylab-kulubu/inscribed-auth/config";
