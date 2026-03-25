// components/ScrollProgress.tsx
"use client";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 origin-left z-[10000] shadow-[0_0_15px_rgba(168,85,247,0.7)] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
