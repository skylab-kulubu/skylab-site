"use client";

import SkylcnScope from "@/components/skylcn/SkylcnScope";
import ErrorScene from "@/components/skylcn/ErrorScene";

// The root layout itself failed, so this page brings its own html and body.
// Drawn with skylcn-ui: see SkylcnScope.
export default function GlobalError() {
  return (
    <html lang="tr">
      <body>
        <SkylcnScope>
          <ErrorScene as="main" />
        </SkylcnScope>
      </body>
    </html>
  );
}
