"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { EditableList, useCmsBlock, EditableRegion } from "inscribed";
import { useCmsContext } from "@/hooks/use-cms-context";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCountdown, parseEventDate } from "@/hooks/use-countdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { cn } from "@/lib/utils";
import { extractDominantColor } from "@/lib/color-extractor";
import type { RGB } from "@/lib/data/types";

const defaultEvents: any[] = [];

const extractionCache = new Map<string, RGB>();

const eventDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const isFeatured = (value: any) =>
  String(value).trim().toLowerCase() === "true";

function FeaturedEventSpotlight({
  event,
  color,
  isVisible,
}: {
  event: any;
  color: RGB;
  isVisible: boolean;
}) {
  const countdown = useCountdown(event.date || null);
  const eventDate = parseEventDate(event.date);

  if (!countdown || countdown.isPast || !eventDate) return null;

  const rgb = `${color.r}, ${color.g}, ${color.b}`;
  const imgSrc =
    typeof event.image === "string" ? event.image : event.image?.src || "";

  const units: [string, number][] = [
    ["Gün", countdown.days],
    ["Saat", countdown.hours],
    ["Dakika", countdown.minutes],
    ["Saniye", countdown.seconds],
  ];

  const content = (
    <div
      className="liquid-glass group relative overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1"
      style={{ "--c-rgb": rgb } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 translate-x-[-150%] -skew-x-12 bg-linear-to-r from-transparent via-white/6 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-20" />
      <div className="flex flex-col md:flex-row">
        {imgSrc && (
          <div className="relative w-full md:w-2/5 aspect-video md:aspect-auto md:min-h-70 overflow-hidden shrink-0">
            <Image
              src={imgSrc}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 pointer-events-none hidden md:block"
              style={{
                background:
                  "linear-gradient(to right, transparent 50%, rgba(10, 10, 30, 0.85) 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none md:hidden"
              style={{
                background:
                  "linear-gradient(to top, rgba(10, 10, 30, 0.85) 0%, transparent 60%)",
              }}
            />
          </div>
        )}

        <div className="relative z-10 flex-1 p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md"
              style={{
                background: `rgba(${rgb}, 0.2)`,
                border: `1px solid rgba(${rgb}, 0.45)`,
                boxShadow: `0 0 14px rgba(${rgb}, 0.2)`,
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: `rgb(${rgb})` }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: `rgb(${rgb})` }}
                />
              </span>
              Yaklaşan Etkinlik
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/15 bg-white/5 backdrop-blur-md">
              <CalendarDays className="w-3 h-3" />
              {eventDateFormatter.format(eventDate)}
            </span>
          </div>

          <h3
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
            style={{ textShadow: `0 0 24px rgba(${rgb}, 0.45)` }}
          >
            {event.title}
          </h3>

          {event.shortDescription && (
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              {event.shortDescription}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-2">
            <div className="flex gap-2 sm:gap-3">
              {units.map(([label, value]) => (
                <div
                  key={label}
                  className="glass-panel rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-center min-w-14 sm:min-w-18"
                  style={
                    {
                      "--c-rgb": rgb,
                    } as React.CSSProperties
                  }
                >
                  <div className="text-xl sm:text-3xl font-black text-white tabular-nums leading-none">
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {event.url && (
              <span
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-300"
                style={{
                  color: `rgb(${Math.min(255, color.r + 60)}, ${Math.min(255, color.g + 60)}, ${Math.min(255, color.b + 60)})`,
                }}
              >
                Detaylar
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-60 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.8), transparent)`,
        }}
      />
    </div>
  );

  return (
    <div
      className={cn(
        "mb-10 md:mb-14 transition-opacity duration-1000 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDelay: "100ms" }}
    >
      {event.url ? (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function EventsSection() {
  const { isAdmin, setActiveBlock } = useCmsContext();
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [eventColors, setEventColors] = useState<Record<string, RGB>>({});

  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);
  const rafRef = useRef<number>(0);

  const eventsBlock = useCmsBlock("events.list", {
    blockType: "List",
    defaultValue: [],
  });
  const eventsList = Array.isArray(eventsBlock.value)
    ? eventsBlock.value
    : defaultEvents;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      checkScroll();
      rafRef.current = 0;
    });
  }, [checkScroll]);

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
      setTimeout(checkScroll, 300);

      return () => {
        ref.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [checkScroll, handleScroll, eventsList]);

  const eventsImageCacheKey = eventsList
    .map(
      (event) =>
        `${event.id || event.title}:${typeof event.image === "string" ? event.image : event.image?.src || ""}`,
    )
    .join("|");

  useEffect(() => {
    let isActive = true;

    const loadColors = async () => {
      const newColors: Record<string, RGB> = {};

      await Promise.all(
        eventsList.map(async (event) => {
          const key = event.id || event.title;
          const imgSrc =
            typeof event.image === "string"
              ? event.image
              : event.image?.src || "";

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
        setEventColors(newColors);
      }
    };

    loadColors();

    return () => {
      isActive = false;
    };
  }, [eventsImageCacheKey]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const showAnimations = isMounted && isVisible;

  const featuredEvent = useMemo(() => {
    if (!isMounted) return null;
    const now = Date.now();
    return (
      eventsList.find((event) => {
        if (!isFeatured(event.featured)) return false;
        const dt = parseEventDate(event.date);
        return dt !== null && dt.getTime() > now;
      }) ?? null
    );
  }, [eventsList, isMounted]);

  const getImgSrc = (image: any) => {
    if (!image) return "";
    return typeof image === "string" ? image : image.src || "";
  };

  const parseCategories = (cat: any) => {
    if (!cat) return [];
    if (Array.isArray(cat)) return cat;
    return cat.split(",").map((c: string) => c.trim());
  };

  const parseTags = (tags: any) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(",").map((t: string) => t.trim());
  };

  return (
    <section
      ref={sectionRef}
      id="etkinlikler"
      className="scroll-mt-32 relative py-12 md:py-16"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeader title="Etkinliklerimiz" isVisible={showAnimations} />

        {featuredEvent && (
          <FeaturedEventSpotlight
            event={featuredEvent}
            color={
              eventColors[featuredEvent.id || featuredEvent.title] || {
                r: 168,
                g: 85,
                b: 247,
              }
            }
            isVisible={showAnimations}
          />
        )}

        <div
          className={cn(
            "relative w-full transition-opacity duration-1000 ease-out",
            showAnimations ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <button
            onClick={() => scroll("left")}
            aria-label="Sola kaydır"
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 bg-[#0a0a1e]/60 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] cursor-pointer"
            style={{
              borderColor: canScrollLeft
                ? "rgba(168, 85, 247, 0.5)"
                : "rgba(255, 255, 255, 0.1)",
              boxShadow: canScrollLeft
                ? "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(168, 85, 247, 0.3)"
                : "0 4px 16px rgba(0, 0, 0, 0.3)",
              opacity: canScrollLeft ? 1 : 0.3,
              pointerEvents: canScrollLeft ? "auto" : "none",
            }}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          <button
            onClick={() => scroll("right")}
            aria-label="Sağa kaydır"
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 bg-[#0a0a1e]/60 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] cursor-pointer"
            style={{
              borderColor: canScrollRight
                ? "rgba(168, 85, 247, 0.5)"
                : "rgba(255, 255, 255, 0.1)",
              boxShadow: canScrollRight
                ? "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(168, 85, 247, 0.3)"
                : "0 4px 16px rgba(0, 0, 0, 0.3)",
              opacity: canScrollRight ? 1 : 0.3,
              pointerEvents: canScrollRight ? "auto" : "none",
            }}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          <div
            ref={scrollRef}
            className="cms-events-row flex gap-5 md:gap-6 items-stretch overflow-x-auto scroll-smooth pt-10 pb-10 px-12 -mx-12 [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <EditableList
              blockPath="events.list"
              itemSchema={{
                id: { blockType: "Text", defaultValue: "" },
                title: { blockType: "Text", defaultValue: "" },
                slug: { blockType: "Text", defaultValue: "" },
                description: { blockType: "RichText", defaultValue: "" },
                shortDescription: { blockType: "Text", defaultValue: "" },
                image: {
                  blockType: "Image",
                  defaultValue: { src: "", alt: "" },
                },
                category: { blockType: "Text", defaultValue: "Zirve" },
                tags: { blockType: "Text", defaultValue: "Networking" },
                url: { blockType: "Text", defaultValue: "" },
                date: { blockType: "Text", defaultValue: "" },
                featured: { blockType: "Text", defaultValue: "false" },
              }}
              defaultValue={[]}
            >
              {(event, index) => {
                const color = eventColors[event.id || event.title] || {
                  r: 168,
                  g: 85,
                  b: 247,
                };
                const rgbVars = `${color.r}, ${color.g}, ${color.b}`;
                const boostBright = 1.4;
                const brightVars = `${Math.min(255, Math.floor(color.r * boostBright))}, ${Math.min(255, Math.floor(color.g * boostBright))}, ${Math.min(255, Math.floor(color.b * boostBright))}`;

                const categories = parseCategories(event.category);
                const tags = parseTags(event.tags);
                const eventDate = parseEventDate(event.date);

                const containerStyle = {
                  transitionDuration: "700ms",
                  transitionDelay: `${200 + index * 80}ms`,
                } as React.CSSProperties;

                const cardStyle = {
                  "--c-rgb": rgbVars,
                  "--c-bright": brightVars,
                  background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.1) 0%, rgba(10, 10, 30, 0.95) 100%)`,
                } as React.CSSProperties;

                const overlayStyle = {
                  background: `linear-gradient(135deg, rgba(var(--c-rgb), 0.15) 0%, transparent 60%)`,
                } as React.CSSProperties;

                const imgOverlayStyle = {
                  background:
                    "linear-gradient(to top, rgba(10, 10, 30, 0.95) 0%, rgba(10, 10, 30, 0.2) 50%, transparent 100%)",
                } as React.CSSProperties;

                const categorySpanStyle = {
                  background: "rgba(var(--c-rgb), 0.15)",
                  border: "1px solid rgba(var(--c-rgb), 0.4)",
                  boxShadow: "0 0 10px rgba(var(--c-rgb), 0.1)",
                } as React.CSSProperties;

                const titleStyle = {
                  textShadow: "0 0 20px rgba(var(--c-rgb), 0.4)",
                } as React.CSSProperties;

                const arrowStyle = {
                  width: "20px",
                  height: "20px",
                } as React.CSSProperties;

                const maskStyle = {
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)",
                  maskImage:
                    "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)",
                } as React.CSSProperties;

                const tagStyle = {
                  textShadow: "0 0 15px rgba(var(--c-rgb), 0.5)",
                } as React.CSSProperties;

                const dividerStyle = {
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)",
                } as React.CSSProperties;

                const borderLineStyle = {
                  background:
                    "linear-gradient(90deg, transparent, rgba(var(--c-rgb), 0.8), transparent)",
                } as React.CSSProperties;

                return (
                  <div
                    key={event.id || index}
                    className={cn(
                      "shrink-0 transition-opacity ease-out",
                      showAnimations ? "opacity-100" : "opacity-0",
                    )}
                    style={containerStyle}
                  >
                    <div
                      onClick={() => {
                        if (isAdmin) {
                          setActiveBlock("events.list");
                        }
                      }}
                      className={cn(
                        "glass-panel group relative w-[320px] md:w-95 flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.02] z-10 hover:z-20 cursor-pointer",
                        isAdmin &&
                          "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
                      )}
                      style={cardStyle}
                    >
                      <div className="pointer-events-none absolute inset-0 translate-x-[-150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                        style={overlayStyle}
                      />

                      <div className="relative w-full aspect-16/10 overflow-hidden shrink-0 z-10">
                        {getImgSrc(event.image) ? (
                          <Image
                            src={getImgSrc(event.image)}
                            alt={event.title}
                            loading="lazy"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 to-indigo-950/40 flex items-center justify-center">
                            <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">
                              Görsel Yok
                            </span>
                          </div>
                        )}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={imgOverlayStyle}
                        />
                      </div>

                      <div className="relative z-10 p-5 md:p-6 flex flex-col grow bg-transparent">
                        <div className="mb-3 flex flex-wrap gap-2">
                          {categories.map((cat: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300"
                              style={categorySpanStyle}
                            >
                              {cat}
                            </span>
                          ))}
                          {eventDate && (
                            <span
                              suppressHydrationWarning
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/15 bg-white/5 backdrop-blur-md"
                            >
                              <CalendarDays className="w-3 h-3" />
                              {eventDateFormatter.format(eventDate)}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-start justify-between gap-3 mb-3 cursor-pointer group/header"
                          onClick={() =>
                            event.url &&
                            window.open(
                              event.url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <h3
                            className="text-xl md:text-2xl font-bold leading-tight transition-colors duration-300 text-white group-hover/header:text-[rgb(var(--c-bright))]"
                            style={titleStyle}
                          >
                            {event.title}
                          </h3>
                          {event.url && (
                            <ArrowUpRight
                              className="shrink-0 transition-all duration-300 mt-1 text-white/60 group-hover/header:text-[rgb(var(--c-bright))] group-hover/header:translate-x-1 group-hover/header:-translate-y-1"
                              style={arrowStyle}
                            />
                          )}
                        </div>

                        <div
                          className="text-sm md:text-base leading-relaxed mb-4 text-white/70 group-hover:text-white/95 transition-colors duration-300 grow"
                          dangerouslySetInnerHTML={{
                            __html: event.description,
                          }}
                        />

                        {tags.length > 0 && (
                          <div
                            className="relative w-full overflow-hidden mt-auto pt-4 shrink-0"
                            style={maskStyle}
                          >
                            <div
                              className="absolute inset-x-0 top-0 h-px pointer-events-none"
                              style={dividerStyle}
                            />
                            <div className="animate-marquee pb-2">
                              {[...tags, ...tags].map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/60 whitespace-nowrap mr-8 transition-colors duration-300 hover:text-white"
                                  style={tagStyle}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                        style={borderLineStyle}
                      />
                    </div>
                  </div>
                );
              }}
            </EditableList>
          </div>
        </div>

        <SectionDivider
          isVisible={showAnimations}
          delay={600}
          className="pt-12"
        />
      </div>
    </section>
  );
}
