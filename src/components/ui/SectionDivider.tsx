"use client";

import { cn } from "@/lib/utils";

interface SectionDividerProps {
  isVisible: boolean;
  delay?: number;
  className?: string;
}

export function SectionDivider({
  isVisible,
  delay = 0,
  className,
}: SectionDividerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
        style={{
          width: isVisible ? "5rem" : "0",
          transitionDelay: `${delay + 100}ms`,
        }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full bg-purple-400/60 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]"
        style={{ animationDuration: "2s" }}
      />
      <div
        className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
        style={{
          width: isVisible ? "5rem" : "0",
          transitionDelay: `${delay + 100}ms`,
        }}
      />
    </div>
  );
}
