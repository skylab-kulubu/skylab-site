import KeycloakProvider from "next-auth/providers/keycloak";
import { createCmsAuthOptions } from "@skylab-kulubu/inscribed-auth/server";

export const authOptions = createCmsAuthOptions({
  provider: KeycloakProvider({
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
    issuer: process.env.KEYCLOAK_ISSUER ?? "",
  }),
  adminRole: "cms:access",
  isAdmin: (session) => {
    if (!session) return false;
    return session.user?.clientRoles?.includes("cms:access") || false;
  },
  extraOptions: {
    logger: {
      error(code, metadata) {
        console.error("\x1b[31m[NextAuth Hata]\x1b[0m", code, metadata);
      },
      warn(code) {
        console.warn("\x1b[33m[NextAuth Uyarı]\x1b[0m", code);
      },
      debug(code, metadata) {
        console.log("[NextAuth Debug]", code, metadata);
      },
    },
  },
});
