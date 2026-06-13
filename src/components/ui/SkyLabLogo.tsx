"use client";

import { useEffect, useState } from "react";
import { SKYLAB_LOGO_CENTER, SKYLAB_LOGO_PATH } from "./skylab-logo-path";

const CENTERED_VIEWBOX = `${SKYLAB_LOGO_CENTER.x - 300} ${SKYLAB_LOGO_CENTER.y - 280} 600 560`;

interface SkyLabLogoProps {
  asLink?: boolean;
}

export function SkyLabLogo({ asLink = false }: SkyLabLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <>
      <div className="relative h-12 w-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-400/40 via-purple-500/10 to-fuchsia-500/40 rounded-full blur-xl opacity-0 scale-80 group-hover:scale-115 group-hover:opacity-100 transition-all duration-700 ease-out will-change-transform" />

        <svg
          viewBox={CENTERED_VIEWBOX}
          className="relative h-11 w-11 transition-all duration-700 ease-out drop-shadow-[0_0_0px_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_12px_rgba(103,232,249,0.7)]"
        >
          <defs>
            <linearGradient
              id="logoGradientNormal"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
            </linearGradient>

            <linearGradient
              id="logoGradientHover"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#22d3ee">
                <animate
                  attributeName="stop-color"
                  values="#22d3ee;#818cf8;#22d3ee"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#ffffff">
                <animate
                  attributeName="stop-color"
                  values="#ffffff;#e0f2fe;#ffffff"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#e879f9">
                <animate
                  attributeName="stop-color"
                  values="#e879f9;#a78bfa;#e879f9"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>

          <path
            className="transition-opacity duration-500 group-hover:opacity-0"
            fill="url(#logoGradientNormal)"
            d={SKYLAB_LOGO_PATH}
          />

          <path
            className="transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            fill="url(#logoGradientHover)"
            d={SKYLAB_LOGO_PATH}
          />
        </svg>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <div
          className="h-6 w-px bg-linear-to-b from-transparent via-white/30 to-transparent transition-all duration-500 ease-out group-hover:via-white/70"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scaleY(1)" : "scaleY(0)",
            transitionDelay: "200ms",
          }}
        />

        <div className="flex items-center transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(147,197,253,0.45)]">
          {"SKY LAB".split("").map((letter, i) =>
            letter === " " ? (
              <span key={i} className="inline-block w-1.5" />
            ) : (
              <span
                key={i}
                className="inline-block text-white text-lg font-bold tracking-wide transition-all duration-500 ease-out"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateX(0)" : "translateX(-12px)",
                  transitionDelay: `${300 + i * 60}ms`,
                }}
              >
                {letter}
              </span>
            )
          )}
        </div>
      </div>
    </>
  );

  if (asLink) {
    return (
      <a href="/" className="group inline-flex items-center gap-3 select-none">
        {content}
      </a>
    );
  }

  return (
    <div className="group inline-flex items-center gap-3 select-none cursor-pointer">
      {content}
    </div>
  );
}
