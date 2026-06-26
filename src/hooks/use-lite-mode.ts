"use client";

import { useEffect, useState } from "react";

export function useLiteMode(): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMemory =
      typeof nav.deviceMemory === "number" &&
      nav.deviceMemory > 0 &&
      nav.deviceMemory <= 4;

    const compute = () =>
      setLite(reduceMq.matches || coarseMq.matches || lowMemory);

    compute();
    reduceMq.addEventListener("change", compute);
    coarseMq.addEventListener("change", compute);
    return () => {
      reduceMq.removeEventListener("change", compute);
      coarseMq.removeEventListener("change", compute);
    };
  }, []);

  return lite;
}
