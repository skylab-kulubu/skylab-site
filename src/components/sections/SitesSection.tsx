"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import { EditableList, useCmsBlock, EditableRegion } from "inscribed";
import { useCmsContext } from "@/hooks/use-cms-context";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { extractDominantColor } from "@/lib/color-extractor";
import type { RGB } from "@/lib/data/types";

const siteItemSchema = {
  id: { blockType: "Text" as const, defaultValue: "" },
  title: { blockType: "Text" as const, defaultValue: "" },
  slug: { blockType: "Text" as const, defaultValue: "" },
  description: { blockType: "Text" as const, defaultValue: "" },
  url: { blockType: "Text" as const, defaultValue: "" },
  image: { blockType: "Image" as const, defaultValue: { src: "", alt: "" } },
  category: { blockType: "Text" as const, defaultValue: "platform" },
  featured: { blockType: "Text" as const, defaultValue: "false" },
};

const defaultSites: any[] = [];

const extractionCache = new Map<string, RGB>();

export default function SitesSection() {
  const { isAdmin, setActiveBlock } = useCmsContext();
  const [isMounted, setIsMounted] = useState(false);
  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);

  const sitesBlock = useCmsBlock("sites.list", {
    blockType: "List",
    defaultValue: [],
  });
  const sitesList = Array.isArray(sitesBlock.value)
    ? sitesBlock.value
    : defaultSites;

  const sortedSites = useMemo(() => {
    return [...sitesList].sort((a, b) => {
      const aFeatured = a.featured === "true" || a.featured === true;
      const bFeatured = b.featured === "true" || b.featured === true;
      return Number(bFeatured) - Number(aFeatured);
    });
  }, [sitesList]);

  const [siteColors, setSiteColors] = useState<Record<string, RGB>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sitesImageCacheKey = sortedSites
    .map(
      (site) =>
        `${site.id || site.title}:${typeof site.image === "string" ? site.image : site.image?.src || ""}`,
    )
    .join("|");

  useEffect(() => {
    let isActive = true;

    const loadColors = async () => {
      const newColors: Record<string, RGB> = {};

      await Promise.all(
        sortedSites.map(async (site) => {
          const key = site.id || site.title;
          const imgSrc =
            typeof site.image === "string" ? site.image : site.image?.src || "";

          if (!imgSrc) {
            newColors[key] = { r: 168, g: 85, b: 247 };
            return;
          }

          if (extractionCache.has(imgSrc)) {
            newColors[key] = extractionCache.get(imgSrc)!;
            return;
          }

          try {
            const color = await extractDominantColor(imgSrc);
            extractionCache.set(imgSrc, color);
            newColors[key] = color;
          } catch {
            newColors[key] = { r: 168, g: 85, b: 247 };
          }
        }),
      );

      if (isActive) {
        setSiteColors(newColors);
      }
    };

    loadColors();

    return () => {
      isActive = false;
    };
  }, [sitesImageCacheKey]);

  const showAnimations = isMounted && isVisible;

  const getImgSrc = (image: any) => {
    if (!image) return "";
    return typeof image === "string" ? image : image.src || "";
  };

  return (
    <section
      ref={sectionRef}
      id="siteler"
      className="scroll-mt-32 relative py-12 md:py-16"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeader title="Sitelerimiz" isVisible={showAnimations} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
          <EditableList
            blockPath="sites.list"
            itemSchema={{
              id: { blockType: "Text", defaultValue: "" },
              title: { blockType: "Text", defaultValue: "" },
              slug: { blockType: "Text", defaultValue: "" },
              description: { blockType: "Text", defaultValue: "" },
              url: { blockType: "Text", defaultValue: "" },
              image: { blockType: "Image", defaultValue: { src: "", alt: "" } },
              category: { blockType: "Text", defaultValue: "platform" },
              featured: { blockType: "Text", defaultValue: "false" },
            }}
            defaultValue={[]}
          >
            {(site, index) => {
              const color = siteColors[site.id || site.title] || {
                r: 168,
                g: 85,
                b: 247,
              };
              const rgbVars = `${color.r}, ${color.g}, ${color.b}`;
              const brighten = (val: number) => Math.min(255, val + 80);
              const brightVars = `${brighten(color.r)}, ${brighten(color.g)}, ${brighten(color.b)}`;
              const isFeatured =
                site.featured === "true" || site.featured === true;

              const cardStyle = {
                "--c-rgb": rgbVars,
                "--c-bright": brightVars,
                background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.1) 0%, rgba(10, 10, 30, 0.95) 100%)`,
              } as React.CSSProperties;

              const overlayStyle = {
                background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.15) 0%, transparent 60%)`,
              } as React.CSSProperties;

              const badgeStyle = {
                background:
                  "linear-gradient(135deg, rgba(var(--c-rgb), 0.9) 0%, rgba(var(--c-rgb), 0.5) 100%)",
                boxShadow:
                  "0 4px 16px rgba(var(--c-rgb), 0.4), inset 0 1px 1px rgba(255,255,255,0.3)",
              } as React.CSSProperties;

              const iconContainerStyle = {
                background:
                  "linear-gradient(135deg, rgba(var(--c-rgb), 0.2) 0%, rgba(var(--c-rgb), 0.05) 100%)",
                border: "1px solid rgba(var(--c-rgb), 0.3)",
                boxShadow: "inset 0 0 20px rgba(var(--c-rgb), 0.15)",
              } as React.CSSProperties;

              const externalIconStyle = {
                color: "rgba(var(--c-rgb), 0.9)",
              } as React.CSSProperties;

              const titleStyle = {
                textShadow: "0 0 20px rgba(var(--c-rgb), 0.4)",
              } as React.CSSProperties;

              const arrowStyle = {
                color: `rgba(var(--c-rgb), 0.5)`,
              } as React.CSSProperties;

              const lineStyle = {
                background:
                  "linear-gradient(90deg, transparent, rgba(var(--c-rgb), 0.6), transparent)",
              } as React.CSSProperties;

              return (
                <div
                  key={site.id || index}
                  className={cn(
                    "h-full transition-opacity duration-1000 ease-out",
                    showAnimations ? "opacity-100" : "opacity-0",
                  )}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isAdmin) {
                        e.preventDefault();
                        setActiveBlock("sites.list");
                      }
                    }}
                    className={cn(
                      "glass-panel group relative flex flex-col justify-center rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] z-10 hover:z-20 h-full",
                      isAdmin &&
                        "cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
                    )}
                    style={{
                      ...cardStyle,
                      transform: "translate3d(0, 0, 0)",
                      willChange: "transform, opacity, filter, backdrop-filter",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 translate-x-[-150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                      style={overlayStyle}
                    />

                    {isFeatured && (
                      <div
                        className="absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-md backdrop-saturate-150 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg"
                        style={badgeStyle}
                      >
                        <Star className="w-4 h-4 text-white fill-white drop-shadow-md" />
                      </div>
                    )}

                    <div className="relative z-10 flex items-center gap-4 md:gap-5 p-5 md:p-6 w-full">
                      <div
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                        style={iconContainerStyle}
                      >
                        {getImgSrc(site.image) ? (
                          <Image
                            src={getImgSrc(site.image)}
                            alt={site.title}
                            loading="lazy"
                            fill
                            sizes="(max-width: 768px) 64px, 80px"
                            className="object-contain p-2 transition-all duration-500 group-hover:brightness-110 group-hover:scale-110"
                          />
                        ) : (
                          <ExternalLink
                            className="w-8 h-8 transition-colors duration-300"
                            style={externalIconStyle}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "flex items-center gap-2 mb-2",
                            isFeatured && "pr-10",
                          )}
                        >
                          <h3
                            className="text-lg md:text-xl font-bold truncate transition-colors duration-300 text-white group-hover:text-[rgb(var(--c-bright))]"
                            style={titleStyle}
                          >
                            {site.title}
                          </h3>
                          <ExternalLink
                            className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-all duration-300 group-hover:text-[rgb(var(--c-bright))]"
                            style={arrowStyle}
                          />
                        </div>
                        <p className="text-sm md:text-base m-0 line-clamp-2 text-white/60 group-hover:text-white/95 transition-colors duration-300">
                          {site.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"
                      style={lineStyle}
                    />
                  </a>
                </div>
              );
            }}
          </EditableList>
        </div>

        <div
          className={cn(
            "pt-12 flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
            style={{
              width: showAnimations ? "5rem" : "0",
              transitionDelay: "500ms",
            }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-purple-400/60 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
            style={{
              width: showAnimations ? "5rem" : "0",
              transitionDelay: "500ms",
            }}
          />
        </div>
      </div>
    </section>
  );
}
