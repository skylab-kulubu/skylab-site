"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  isVisible: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  isVisible,
  className,
}: SectionHeaderProps) {
  return (
    <h2
      className={cn(
        "text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        className,
      )}
    >
      <span className="title-gradient">{title}</span>
    </h2>
  );
}
