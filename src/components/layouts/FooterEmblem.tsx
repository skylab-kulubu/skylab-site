"use client";

import { useEffect, useRef, useState } from "react";
import { SKYLAB_LOGO_CENTER, SKYLAB_LOGO_PATH } from "@/components/ui/skylab-logo-path";
import { cn } from "@/lib/utils";

const CENTERED_VIEWBOX = `${SKYLAB_LOGO_CENTER.x - 300} ${SKYLAB_LOGO_CENTER.y - 280} 600 560`;

const WAVE_PATH =
  "M0,60 Q50,0 100,60 T200,60 T300,60 T400,60 T500,60 T600,60 T700,60 T800,60 T900,60 T1000,60 T1100,60 T1200,60 V700 H0 Z";

export default function FooterEmblem() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setAutoFilled(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAutoFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      ref={wrapperRef}
      onClick={scrollToTop}
      aria-hidden="true"
      className={cn(
        "group absolute -top-22 left-1/2 -translate-x-1/2 z-20 select-none cursor-pointer",
        autoFilled && "emblem-filled"
      )}
    >
      <div className="absolute inset-1 -z-10 rounded-full blur-2xl opacity-50 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:blur-3xl bg-[radial-gradient(circle,rgba(168,85,247,0.55)_0%,rgba(99,102,241,0.28)_45%,transparent_72%)]" />
      <svg
        viewBox={CENTERED_VIEWBOX}
        className="h-44 w-44 transition-all duration-700 ease-out drop-shadow-[0_0_10px_rgba(129,140,248,0.25)] group-hover:drop-shadow-[0_0_34px_rgba(168,85,247,0.9)]"
      >
        <defs>
          <linearGradient id="emblemLiquidA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="12.5%" stopColor="#a855f7" />
            <stop offset="25%" stopColor="#e879f9" />
            <stop offset="37.5%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#67e8f9" />
            <stop offset="62.5%" stopColor="#a855f7" />
            <stop offset="75%" stopColor="#e879f9" />
            <stop offset="87.5%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="emblemLiquidB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="emblemLiquidDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(15,12,52,0)" />
            <stop offset="100%" stopColor="rgba(15,12,52,0.5)" />
          </linearGradient>
          <linearGradient id="emblemGlassEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
          </linearGradient>
          <linearGradient id="emblemGlassBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.13)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
          <linearGradient id="emblemGlassSheen" x1="0%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id="emblemClip">
            <path d={SKYLAB_LOGO_PATH} />
          </clipPath>
        </defs>

        <path d={SKYLAB_LOGO_PATH} fill="url(#emblemGlassBody)" />

        <g clipPath="url(#emblemClip)">
          <g className="emblem-liquid">
            <path
              className="emblem-wave"
              d={WAVE_PATH}
              fill="url(#emblemLiquidB)"
              opacity="0.6"
              style={{ animationDuration: "9s", animationDelay: "-3s" }}
            />
            <path
              className="emblem-wave"
              d={WAVE_PATH}
              fill="url(#emblemLiquidA)"
              opacity="0.9"
            />
            <rect x="0" y="90" width="1200" height="610" fill="url(#emblemLiquidDepth)" />
          </g>
          <path d={SKYLAB_LOGO_PATH} fill="url(#emblemGlassSheen)" />
        </g>

        <path
          d={SKYLAB_LOGO_PATH}
          fill="none"
          stroke="url(#emblemGlassEdge)"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
