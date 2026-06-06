import { revalidateCmsSlug } from "inscribed/actions";
import { createCmsPage } from "inscribed/page";
import { NextAuthCmsProvider } from "@skylab-kulubu/inscribed-auth";
import { withCmsAuth, getClientCredentialsToken } from "@skylab-kulubu/inscribed-auth/server";
import { cmsConfig } from "./cms-config";
import { authOptions } from "./auth";

export const CmsPage = createCmsPage({
  config: cmsConfig,
  Provider: NextAuthCmsProvider,
  getServiceToken: getClientCredentialsToken,
  ...withCmsAuth(authOptions),
  onAfterSave: revalidateCmsSlug,
});
