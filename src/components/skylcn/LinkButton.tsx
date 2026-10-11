"use client";

import { buttonVariants } from "@skylab-kulubu/skylcn-ui";
import type { ComponentProps } from "react";

// A link drawn as skylcn-ui's Button. A plain <a> keeps link semantics (Button
// rendered as a link gets role="button"), and leaving the page is a full page
// load, so skylcn-ui's stylesheet does not follow the reader: see SkylcnScope.
export default function LinkButton({
  variant = "outline",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: "primary" | "outline" }) {
  return <a className={buttonVariants({ variant, size: "lg", className })} {...props} />;
}
