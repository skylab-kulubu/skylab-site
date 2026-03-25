"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const ScrollReveal = () => {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  const scrollOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const scrollTranslateY = useTransform(scrollY, [0, 450], [0, 40]);
  const pointerEvents = useTransform(scrollY, (v) =>
    v > 400 ? "none" : "auto"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        opacity: scrollOpacity,
        y: scrollTranslateY,
        pointerEvents,
      }}
      className="flex flex-col items-center gap-5 cursor-pointer group"
      onClick={() => {
        if (scrollY.get() < 200) {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 2.2,
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="flex flex-col items-center gap-5"
      >
        <span className="text-[11px] tracking-[0.5em] uppercase font-bold text-white/30 group-hover:text-purple-400/90 transition-all duration-700 ease-in-out drop-shadow-sm">
          Kaydır
        </span>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "relative p-4 rounded-full transition-all duration-700",
            "bg-white/3 backdrop-blur-xl border border-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)]",
            "group-hover:scale-110 group-hover:border-purple-500/40 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
          )}
        >
          <div
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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

          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-purple-500/15 blur-xl -z-10"
          />

          <div className="pointer-events-none absolute inset-0 rounded-full transition-all duration-1000 group-hover:bg-white/2" />

          <motion.svg
            animate={{ opacity: [0.4, 1, 0.4], y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};