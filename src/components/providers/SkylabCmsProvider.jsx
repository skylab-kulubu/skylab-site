"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { CmsProvider } from "inscribed";

// An editor can put the editing panel and the page's edit marks away and look at the
// site as visitors do, while staying signed in. Kept per browser.
const HIDDEN_KEY = "cms-panel-gizli";
const listeners = new Set();

function subscribe(onChange) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

function writeHidden(hidden) {
  try {
    if (hidden) localStorage.setItem(HIDDEN_KEY, "1");
    else localStorage.removeItem(HIDDEN_KEY);
  } catch {
    // Storage blocked: the switch still works for this page view.
  }
  listeners.forEach((onChange) => onChange());
}

const PanelSwitchContext = createContext({
  canEdit: false,
  hidden: false,
  /** @param {boolean} _hidden */
  setHidden: (_hidden) => {},
});

/** Whether the signed-in user may edit, and the switch that shows or hides the editing panel. */
export function useCmsPanelSwitch() {
  return useContext(PanelSwitchContext);
}

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

  const hidden = useSyncExternalStore(subscribe, readHidden, () => false);
  const panelSwitch = useMemo(
    () => ({ canEdit: Boolean(isAdmin), hidden, setHidden: writeHidden }),
    [isAdmin, hidden],
  );

  return (
    <PanelSwitchContext.Provider value={panelSwitch}>
      <CmsProvider
        {...props}
        isAdmin={Boolean(isAdmin) && !hidden}
        getAccessToken={getAccessToken}
        userInfo={userInfo}
        onSignOut={onSignOut}
      >
        {children}
      </CmsProvider>
    </PanelSwitchContext.Provider>
  );
}

export function SkylabCmsProvider({ session, ...props }) {
  return (
    <SessionProvider session={session}>
      <Inner {...props} />
    </SessionProvider>
  );
}
