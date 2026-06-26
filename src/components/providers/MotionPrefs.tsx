"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useLiteMode } from "@/hooks/use-lite-mode";

export default function MotionPrefs({
  children,
}: {
  children: React.ReactNode;
}) {
  const lite = useLiteMode();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-fx", lite);
    return () => root.classList.remove("reduce-fx");
  }, [lite]);

  return (
    <MotionConfig reducedMotion={lite ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
