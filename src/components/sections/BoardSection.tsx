"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { boardMembers } from "@/lib/data";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

export default function BoardSection() {
  const [selectedBoard, setSelectedBoard] = useState<
    "management" | "supervision"
  >("management");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { ref: sectionRef, isVisible } = useScrollReveal(0.2);

  const currentMembers =
    selectedBoard === "management"
      ? boardMembers.management
      : boardMembers.supervision;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      setTimeout(checkScroll, 200);

      return () => {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [selectedBoard, currentMembers]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBoardChange = (board: "management" | "supervision") => {
    if (board === selectedBoard) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setSelectedBoard(board);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "instant" });
      }

      setTimeout(() => {
        setIsTransitioning(false);
        checkScroll();
      }, 50);
    }, 200);
  };

  return (
    <section
      ref={sectionRef}
      id="kurul"
      className="scroll-mt-28 relative py-12 md:py-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div
          className={cn(
            "transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-16">
            <span className="bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Kurullarımız
            </span>
          </h2>
        </div>

        <div
          className={cn(
            "flex justify-center mb-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{ transitionDelay: "100ms" }}
        >
          <div
            className="inline-flex rounded-full p-1.5 relative overflow-hidden border transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 20, 40, 0.4) 0%, rgba(10, 10, 30, 0.6) 100%)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow:
                "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: "1px",
              }}
            />

            <button
              onClick={() => handleBoardChange("management")}
              className={cn(
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300",
                selectedBoard === "management"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              style={
                selectedBoard === "management"
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(168, 85, 247, 0.25)",
                    }
                  : {}
              }
            >
              Yönetim Kurulu
            </button>
            <button
              onClick={() => handleBoardChange("supervision")}
              className={cn(
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300",
                selectedBoard === "supervision"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              style={
                selectedBoard === "supervision"
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(168, 85, 247, 0.25)",
                    }
                  : {}
              }
            >
              Denetim Kurulu
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative w-full transition-all duration-1000 ease-out mt-8",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 30, 0.98) 100%)",
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
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 30, 0.98) 100%)",
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
            className="flex gap-5 md:gap-8 overflow-x-auto scroll-smooth pb-12 pt-8 px-2 -mx-2 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {currentMembers.map((member, index) => {
              const socialLinks = [
                { icon: Linkedin, url: member.linkedin, label: "LinkedIn" },
                { icon: Github, url: member.github, label: "GitHub" },
                { icon: Twitter, url: member.twitter, label: "Twitter" },
                { icon: Instagram, url: member.instagram, label: "Instagram" },
              ].filter((link) => link.url);

              return (
                <div
                  key={member.id}
                  className={cn(
                    "relative shrink-0 w-70 md:w-[320px] transition-all ease-out",
                    isVisible && !isTransitioning
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  )}
                  style={{
                    transitionDuration: isTransitioning ? "150ms" : "700ms",
                    transitionDelay: isTransitioning
                      ? "0ms"
                      : `${200 + index * 80}ms`,
                    isolation: "isolate",
                  }}
                >
                  <div className="group relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer aspect-3/4 z-10 hover:z-20 bg-linear-to-br from-[#141428]/60 to-[#0a0a1e]/80 border-white/5 hover:border-purple-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(168,85,247,0.3)] hover:-translate-y-3 hover:scale-[1.02]">
                    <div className="pointer-events-none absolute inset-0 -translate-x-[150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 bg-linear-to-br from-purple-500/10 to-transparent" />

                    <Image
                      src={member.image}
                      loading="lazy"
                      alt={member.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 brightness-90"
                    />

                    <div
                      className="absolute inset-0 transition-all duration-500 z-10"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10, 10, 30, 0.95) 0%, rgba(10, 10, 30, 0.4) 40%, rgba(10, 10, 30, 0.1) 70%, transparent 100%)",
                      }}
                    />

                    {socialLinks.length > 0 && (
                      <div className="absolute top-4 right-4 flex flex-col gap-2 transition-all duration-500 opacity-0 translate-x-5 group-hover:opacity-100 group-hover:translate-x-0 z-40">
                        {socialLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.label}
                            className="p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 hover:bg-white/20"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <link.icon className="w-4 h-4 text-white" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                      <h3 className="text-xl font-bold mb-1.5 transition-colors duration-300 whitespace-normal text-white group-hover:text-purple-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                        {member.name}
                      </h3>

                      <p className="text-sm font-medium line-clamp-2 transition-colors duration-300 text-purple-400 group-hover:text-purple-300/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                        {member.position}
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30 bg-linear-to-r from-transparent via-purple-500/60 to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "pt-8 flex items-center justify-center gap-2 transition-all ease-out",
            isVisible && !isTransitioning
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
          style={{
            transitionDuration: isTransitioning ? "150ms" : "1000ms",
            transitionDelay: isTransitioning ? "0ms" : "500ms",
          }}
        >
          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000 ease-out"
            style={{
              width: isVisible && !isTransitioning ? "5rem" : "0",
              opacity: isVisible && !isTransitioning ? 1 : 0,
              transitionDelay: isTransitioning ? "0ms" : "700ms",
            }}
          />

          <div
            className="h-1.5 w-1.5 rounded-full bg-purple-400/60 animate-pulse transition-all duration-500"
            style={{
              animationDuration: "2s",
              boxShadow: "0 0 8px rgba(168, 85, 247, 0.6)",
              transform:
                isVisible && !isTransitioning ? "scale(1)" : "scale(0)",
              transitionDelay: isTransitioning ? "0ms" : "600ms",
            }}
          />

          <div
            className="h-0.5 bg-linear-to-r from-transparent via-purple-400/50 to-transparent rounded-full transition-all duration-1000 ease-out"
            style={{
              width: isVisible && !isTransitioning ? "5rem" : "0",
              opacity: isVisible && !isTransitioning ? 1 : 0,
              transitionDelay: isTransitioning ? "0ms" : "700ms",
            }}
          />
        </div>
      </div>
    </section>
  );
}
