"use client";

import { StatsCard } from "@/components/ui/StatsCard";
import * as Icons from "lucide-react";
import { stats } from "@/lib/data";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StatsCards({
  isVisible: propIsVisible,
}: {
  isVisible?: boolean;
}) {
  const { ref: sectionRef, isVisible: scrollIsVisible } = useScrollReveal(0.3);
  const isVisible = propIsVisible ?? scrollIsVisible;

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);
  const translateY = useTransform(scrollY, [0, 450], [0, -20]);
  const pointerEvents = useTransform(scrollY, (v) =>
    v > 400 ? "none" : "auto"
  );

  return (
    <motion.div
      style={{ opacity, y: translateY, pointerEvents }}
      className="relative z-30 w-full"
    >
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = (Icons as any)[stat.iconName];

            return (
              <div
                key={index}
                className={cn(
                  "transition-all ease-out",
                  isVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-16 scale-95"
                )}
                style={{
                  transitionDuration: "800ms",
                  transitionDelay: `${stat.delay}ms`,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  isolation: "isolate",
                }}
              >
                <StatsCard
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  icon={Icon}
                  delay={stat.delay}
                  isVisible={isVisible}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
