"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCounterAnimation } from "@/hooks/use-counter-animation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  className?: string;
  delay?: number;
  isVisible?: boolean;
}

export function StatsCard({
  value,
  label,
  prefix = "",
  suffix = "",
  icon: Icon,
  className,
  delay = 0,
  isVisible = false,
}: StatsCardProps) {
  const animatedValue = useCounterAnimation(value, 2000, 0, delay, isVisible);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500 hover:scale-[1.03]",
        "border-white/10 hover:border-purple-500/40",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(20, 20, 40, 0.6) 0%, rgba(10, 10, 30, 0.8) 100%)",
        boxShadow:
          "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, transparent 100%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />

      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-purple-500/20 opacity-40 blur-2xl sm:blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-60" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-violet-500/20 opacity-30 blur-2xl sm:blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-50" />
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/8 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
      <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

      <CardContent className="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center gap-y-3 sm:gap-y-5 text-center">
        {Icon && (
          <div
            className="relative rounded-full p-2.5 sm:p-3.5 transition-all duration-500 group-hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              boxShadow:
                "inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(168, 85, 247, 0.15)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 -z-10 scale-150 rounded-full bg-purple-500/50 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <Icon
              className="h-5 w-5 sm:h-7 sm:w-7 text-white"
              style={{
                filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))",
              }}
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-y-1 sm:gap-y-1.5">
          <span
            className="inline-block bg-linear-to-br from-white via-white to-purple-200 bg-clip-text text-3xl sm:text-5xl md:text-6xl font-bold text-transparent tracking-tight transition-transform duration-500 group-hover:scale-105"
            style={{
              filter: "drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3))",
              WebkitBackgroundClip: "text",
            }}
          >
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </span>

          <p
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 text-white/80 group-hover:text-white"
            style={{
              textShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
            }}
          >
            {label}
          </p>
        </div>
      </CardContent>

      <div
        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)",
          opacity: isVisible ? 1 : 0,
        }}
      />
    </Card>
  );
}