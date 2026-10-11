import { unstable_rethrow } from "next/navigation";
import { revalidateCmsCollection, revalidateCmsSlug } from "inscribed/actions";
import { CollectionProvider, CollectionRecord, CollectionRows } from "inscribed/collections";
import { createCmsPage } from "inscribed/page";
import { withCmsAuth } from "@skylab-kulubu/inscribed-auth/server";
import { SkylabCmsProvider } from "@/components/providers/SkylabCmsProvider";
import { cmsConfig } from "./cms-config";
import { authOptions } from "./auth";

const auth = withCmsAuth(authOptions);

// Published content is read without a token (cmsConfig.clientKey); an editor's
// drafts arrive in the browser with their own token.
export const { CmsPage } = createCmsPage({
  config: cmsConfig,
  Provider: SkylabCmsProvider,
  collections: { CollectionProvider, CollectionRecord, CollectionRows },
  ...auth,
  // A sign-in that cannot be resolved (a missing secret, Keycloak unreachable) must
  // not take the public site down with it: the page renders as it does for visitors.
  getSession: async () => {
    try {
      return await auth.getSession();
    } catch (error) {
      // Next's own signals (this route is dynamic, a redirect) pass through untouched.
      unstable_rethrow(error);
      console.error("[cms] session could not be read, rendering the public page", error);
      return null;
    }
  },
  // Only what the browser needs: who is signed in and the token for writes.
  sessionForClient: (session: { user?: unknown; accessToken?: string; error?: string } | null) =>
    session ? { user: session.user, accessToken: session.accessToken, error: session.error } : null,
  onAfterSave: revalidateCmsSlug,
  onAfterCollectionSave: revalidateCmsCollection,
});
