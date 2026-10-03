"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { CmsProvider } from "inscribed";

// The adapter package's NextAuthCmsProvider forwards only the props it names and
// drops the ones inscribed 5 adds, so this wrapper forwards everything it is given.
// It can go back to NextAuthCmsProvider once the adapter forwards the rest.
function Inner({ isAdmin, children, ...props }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") signIn("keycloak");
  }, [session?.error]);

  const getAccessToken = useCallback(
    async () => session?.accessToken ?? "",
    [session?.accessToken],
  );

  const userInfo = useMemo(
    () =>
      session?.user
        ? {
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
          }
        : null,
    [session?.user?.name, session?.user?.email, session?.user?.image],
  );

  const onSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <CmsProvider
      {...props}
      isAdmin={isAdmin}
      getAccessToken={getAccessToken}
      userInfo={userInfo}
      onSignOut={onSignOut}
    >
      {children}
    </CmsProvider>
  );
}

export function SkylabCmsProvider({ session, ...props }) {
  return (
    <SessionProvider session={session}>
      <Inner {...props} />
    </SessionProvider>
  );
}
