"use client";

import SkylcnScope from "@/components/skylcn/SkylcnScope";
import ErrorScene from "@/components/skylcn/ErrorScene";

// A page that failed to render, inside the root layout. Drawn with skylcn-ui: see SkylcnScope.
export default function Error() {
  return (
    <SkylcnScope>
      <ErrorScene />
    </SkylcnScope>
  );
}
