"use client";

import { OfflineScenePage, ServerErrorScenePage } from "@skylab-kulubu/skylcn-ui";
import { useSyncExternalStore } from "react";

function onConnectionChange(change: () => void) {
  window.addEventListener("online", change);
  window.addEventListener("offline", change);
  return () => {
    window.removeEventListener("online", change);
    window.removeEventListener("offline", change);
  };
}

// A full page load, not the boundary's reset(): the error page brought skylcn-ui's
// stylesheet into the document, and a reload is the only way to leave it behind
// (see SkylcnScope). It asks the server again too, which is what a 500 needs.
function reload() {
  window.location.reload();
}

// The error boundaries' page (app/error.tsx, app/global-error.tsx): the club's 500 scene,
// or the offline one while the browser has no connection. Each kind's own page keeps the
// other kinds' drawings out of the bundle. `as="div"` inside the root layout's main.
export default function ErrorScene({ as = "div" }: { as?: "main" | "div" }) {
  // Read in the browser only: the server and the first browser render both say online
  const offline = useSyncExternalStore(
    onConnectionChange,
    () => !navigator.onLine,
    () => false,
  );
  const className = "min-h-0 flex-1 bg-transparent px-5 pt-10 pb-12";
  return offline ? (
    <OfflineScenePage onAction={reload} as={as} className={className} />
  ) : (
    <ServerErrorScenePage onAction={reload} as={as} className={className} />
  );
}
