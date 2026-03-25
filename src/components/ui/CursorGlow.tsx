"use client";

import { useEffect, useState, useRef } from "react";

export default function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const glowRef1 = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);
  const glowRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isNarrowScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isNarrowScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mounted) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;

        if (glowRef1.current) {
          glowRef1.current.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
        }
        if (glowRef2.current) {
          glowRef2.current.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
        }
        if (glowRef3.current) {
          glowRef3.current.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, mounted]);

  if (!mounted || isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 9998 }}
      aria-hidden="true"
    >
      <div
        ref={glowRef1}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: "500px",
          height: "500px",
          transform: "translate3d(-1000px, -1000px, 0)",
          background: `
            radial-gradient(
              circle,
              rgba(168, 85, 247, 0.06) 0%,
              rgba(139, 92, 246, 0.04) 25%,
              rgba(99, 102, 241, 0.02) 50%,
              transparent 70%
            )
          `,
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      />
      <div
        ref={glowRef2}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: "300px",
          height: "300px",
          transform: "translate3d(-1000px, -1000px, 0)",
          background: `
            radial-gradient(
              circle,
              rgba(192, 132, 252, 0.08) 0%,
              rgba(168, 85, 247, 0.04) 40%,
              transparent 70%
            )
          `,
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      />
      <div
        ref={glowRef3}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: "100px",
          height: "100px",
          transform: "translate3d(-1000px, -1000px, 0)",
          background: `
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.06) 0%,
              rgba(216, 180, 254, 0.04) 30%,
              transparent 60%
            )
          `,
          transition: "transform 0.05s ease-out",
          willChange: "transform",
        }}
      />
    </div>
  );
}
