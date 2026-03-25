"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { getAllEvents } from "@/lib/data";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { extractDominantColor, type RGB } from "@/lib/color-extractor";

const categoryColors: Record<string, RGB> = {
  hackathon: { r: 168, g: 85, b: 247 },
  workshop: { r: 59, g: 130, b: 246 },
  seminer: { r: 236, g: 72, b: 153 },
  yarışma: { r: 239, g: 68, b: 68 },
  buluşma: { r: 34, g: 197, b: 94 },
  zirve: { r: 139, g: 92, b: 246 },
  default: { r: 99, g: 102, b: 241 },
};

const events = getAllEvents();

export default function EventsSection() {
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [eventColors, setEventColors] = useState<Record<string, RGB>>({});
  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);
  const rafRef = useRef<number>(0);

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
  }, [checkScroll, handleScroll]);

  useEffect(() => {
    let isActive = true;

    const loadColors = async () => {
      const newColors: Record<string, RGB> = {};

      await Promise.all(
        events.map(async (event) => {
          const primaryCategory =
            event.category?.length > 0
              ? event.category[0].toLowerCase()
              : "default";
          const fallback =
            categoryColors[primaryCategory] || categoryColors.default;

          if (!event.image) {
            newColors[event.id] = fallback;
            return;
          }

          try {
            newColors[event.id] = await extractDominantColor(event.image);
          } catch {
            newColors[event.id] = fallback;
          }
        })
      );

      if (isActive) {
        setEventColors(newColors);
      }
    };

    loadColors();

    return () => {
      isActive = false;
    };
  }, []);

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

  return (
    <section
      ref={sectionRef}
      id="etkinlikler"
      className="scroll-mt-32 relative py-12 md:py-16 overflow-hidden"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
        >
          <span className="bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Etkinliklerimiz
          </span>
        </h2>

        <div
          className={cn(
            "relative w-full transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 bg-[#0a0a1e]/80 backdrop-blur-xl"
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
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 bg-[#0a0a1e]/80 backdrop-blur-xl"
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
            className="flex gap-5 md:gap-6 items-stretch overflow-x-auto scroll-smooth pt-8 px-2 -mx-2 [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {events.map((event, index) => {
              const primaryCategory =
                event.category?.length > 0
                  ? event.category[0].toLowerCase()
                  : "default";
              const color =
                eventColors[event.id] ||
                categoryColors[primaryCategory] ||
                categoryColors.default;

              const rgbVars = `${color.r}, ${color.g}, ${color.b}`;
              const boostBright = 1.4;
              const brightVars = `${Math.min(
                255,
                Math.floor(color.r * boostBright)
              )}, ${Math.min(
                255,
                Math.floor(color.g * boostBright)
              )}, ${Math.min(255, Math.floor(color.b * boostBright))}`;

              return (
                <div
                  key={event.id}
                  className={cn(
                    "shrink-0 transition-all ease-out",
                    showAnimations
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  )}
                  style={{
                    transitionDuration: "700ms",
                    transitionDelay: `${200 + index * 80}ms`,
                  }}
                >
                  <div
                    className={cn(
                      "group relative w-[320px] md:w-95 flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.02] z-10 hover:z-20 cursor-pointer",
                      "border border-white/5 hover:border-[rgba(var(--c-rgb),0.5)]",
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

                    <div className="relative w-full aspect-16/10 overflow-hidden shrink-0 z-10">
                      <Image
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(10, 10, 30, 0.95) 0%, rgba(10, 10, 30, 0.2) 50%, transparent 100%)",
                        }}
                      />
                    </div>

                    <div className="relative z-10 p-5 md:p-6 flex flex-col grow bg-transparent">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {event.category.map((cat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300"
                            style={{
                              background: "rgba(var(--c-rgb), 0.15)",
                              border: "1px solid rgba(var(--c-rgb), 0.4)",
                              boxShadow: "0 0 10px rgba(var(--c-rgb), 0.1)",
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      <div
                        className="flex items-start justify-between gap-3 mb-3 cursor-pointer group/header"
                        onClick={() =>
                          event.url &&
                          window.open(
                            event.url,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <h3
                          className="text-xl md:text-2xl font-bold leading-tight transition-colors duration-300 text-white group-hover/header:text-[rgb(var(--c-bright))]"
                          style={{
                            textShadow: "0 0 20px rgba(var(--c-rgb), 0.4)",
                          }}
                        >
                          {event.title}
                        </h3>
                        {event.url && (
                          <ArrowUpRight
                            className="shrink-0 transition-all duration-300 mt-1 text-white/60 group-hover/header:text-[rgb(var(--c-bright))] group-hover/header:translate-x-1 group-hover/header:-translate-y-1"
                            style={{ width: "20px", height: "20px" }}
                          />
                        )}
                      </div>

                      <p className="text-sm md:text-base leading-relaxed mb-4 text-white/70 group-hover:text-white/95 transition-colors duration-300 grow">
                        {event.description}
                      </p>

                      <div
                        className="relative w-full overflow-hidden mt-auto pt-4 border-t border-white/10 shrink-0"
                        style={{
                          WebkitMaskImage:
                            "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)",
                          maskImage:
                            "linear-gradient(to right, transparent, black 30px, black calc(100% - 30px), transparent)",
                        }}
                      >
                        <div className="animate-marquee pb-2">
                          {[...event.tags, ...event.tags].map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block text-[11px] font-bold uppercase tracking-widest text-white/60 whitespace-nowrap mr-8 transition-colors duration-300 hover:text-white"
                              style={{
                                textShadow: "0 0 15px rgba(var(--c-rgb), 0.5)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(var(--c-rgb), 0.8), transparent)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "pt-12 flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "600ms" }}
        >
          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000"
            style={{
              width: showAnimations ? "5rem" : "0",
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
              width: showAnimations ? "5rem" : "0",
              transitionDelay: "700ms",
            }}
          />
        </div>
      </div>
    </section>
  );
}
