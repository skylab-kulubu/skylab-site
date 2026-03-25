"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { sites } from "@/lib/data";
import { extractDominantColor, type RGB } from "@/lib/color-extractor";

export interface Site {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  image: string;
  icon?: React.ReactNode;
  category:
    | "project"
    | "tool"
    | "resource"
    | "platform"
    | "other"
    | "community"
    | "education";
  featured: boolean;
  tags: string[];
}

const categoryColors: Record<string, RGB> = {
  project: { r: 168, g: 85, b: 247 },
  tool: { r: 59, g: 130, b: 246 },
  resource: { r: 34, g: 197, b: 94 },
  platform: { r: 236, g: 72, b: 153 },
  community: { r: 249, g: 115, b: 22 },
  education: { r: 14, g: 165, b: 233 },
  default: { r: 99, g: 102, b: 241 },
};

export default function SitesSection() {
  const [siteColors, setSiteColors] = useState<Record<string, RGB>>({});
  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);

  const sortedSites = useMemo(() => {
    return [...(sites as Site[])].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadColors = async () => {
      const newColors: Record<string, RGB> = {};

      await Promise.all(
        sortedSites.map(async (site) => {
          const fallback =
            categoryColors[site.category?.toLowerCase()] ||
            categoryColors.default;

          if (!site.image) {
            newColors[site.id] = fallback;
            return;
          }

          try {
            newColors[site.id] = await extractDominantColor(site.image);
          } catch {
            newColors[site.id] = fallback;
          }
        })
      );

      if (isMounted) {
        setSiteColors(newColors);
      }
    };

    loadColors();

    return () => {
      isMounted = false;
    };
  }, [sortedSites]);

  return (
    <section
      ref={sectionRef}
      id="siteler"
      className="scroll-mt-28 relative py-12 md:py-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
        >
          <span className="bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Sitelerimiz
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
          {sortedSites.map((site, index) => {
            const color =
              siteColors[site.id] ||
              categoryColors[site.category?.toLowerCase()] ||
              categoryColors.default;
            const rgbVars = `${color.r}, ${color.g}, ${color.b}`;
            const brighten = (val: number) => Math.min(255, val + 80);
            const brightVars = `${brighten(color.r)}, ${brighten(
              color.g
            )}, ${brighten(color.b)}`;

            return (
              <div
                key={site.id}
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group relative flex flex-col justify-center rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] z-10 hover:z-20 h-full",
                    "bg-white/3 backdrop-blur-xl border border-white/10 hover:border-[rgba(var(--c-rgb),0.5)]",
                    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.3)]",
                    "hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(var(--c-rgb),0.3)]"
                  )}
                  style={{
                    ["--c-rgb" as string]: rgbVars,
                    ["--c-bright" as string]: brightVars,
                    background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.1) 0%, rgba(10, 10, 30, 0.95) 100%)`,
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 -translate-x-[150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                    style={{
                      background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.15) 0%, transparent 60%)`,
                    }}
                  />

                  {site.featured && (
                    <div
                      className="absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(var(--c-rgb), 0.9) 0%, rgba(var(--c-rgb), 0.5) 100%)",
                        boxShadow:
                          "0 4px 16px rgba(var(--c-rgb), 0.4), inset 0 1px 1px rgba(255,255,255,0.3)",
                      }}
                    >
                      <Star className="w-4 h-4 text-white fill-white drop-shadow-md" />
                    </div>
                  )}

                  <div className="relative z-10 flex items-center gap-4 md:gap-5 p-5 md:p-6 w-full">
                    <div
                      className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(var(--c-rgb), 0.2) 0%, rgba(var(--c-rgb), 0.05) 100%)",
                        border: "1px solid rgba(var(--c-rgb), 0.3)",
                        boxShadow: "inset 0 0 20px rgba(var(--c-rgb), 0.15)",
                      }}
                    >
                      {site.icon ? (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {site.icon}
                        </div>
                      ) : site.image ? (
                        <Image
                          src={site.image}
                          alt={site.title}
                          loading="lazy"
                          fill
                          className="object-contain p-2 transition-all duration-500 group-hover:brightness-110 group-hover:scale-110"
                        />
                      ) : (
                        <ExternalLink
                          className="w-8 h-8 transition-colors duration-300"
                          style={{ color: "rgba(var(--c-rgb), 0.9)" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-2",
                          site.featured && "pr-10"
                        )}
                      >
                        <h3
                          className="text-lg md:text-xl font-bold truncate transition-colors duration-300 text-white group-hover:text-[rgb(var(--c-bright))]"
                          style={{
                            textShadow: "0 0 20px rgba(var(--c-rgb), 0.4)",
                          }}
                        >
                          {site.title}
                        </h3>
                        <ExternalLink
                          className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-all duration-300 group-hover:text-[rgb(var(--c-bright))]"
                          style={{ color: `rgba(var(--c-rgb), 0.5)` }}
                        />
                      </div>
                      <p className="text-sm md:text-base m-0 line-clamp-2 text-white/60 group-hover:text-white/95 transition-colors duration-300">
                        {site.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(var(--c-rgb), 0.6), transparent)",
                    }}
                  />
                </a>
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "pt-12 flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "600ms" }}
        >
          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
            style={{
              width: isVisible ? "5rem" : "0",
              transitionDelay: "700ms",
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
              transitionDelay: "700ms",
            }}
          />
        </div>
      </div>
    </section>
  );
}
