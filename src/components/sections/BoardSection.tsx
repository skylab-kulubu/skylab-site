"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
} from "@/components/ui/BrandIcons";
import { EditableList, useCmsBlock, EditableRegion } from "inscribed";
import { useCmsContext } from "@/hooks/use-cms-context";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { extractDominantColor } from "@/lib/color-extractor";
import type { RGB } from "@/lib/data/types";

const boardMemberSchema = {
  id: { blockType: "Text" as const, defaultValue: "" },
  name: { blockType: "Text" as const, defaultValue: "" },
  position: { blockType: "Text" as const, defaultValue: "" },
  image: { blockType: "Image" as const, defaultValue: { src: "", alt: "" } },
  linkedin: { blockType: "Text" as const, defaultValue: "" },
  github: { blockType: "Text" as const, defaultValue: "" },
  twitter: { blockType: "Text" as const, defaultValue: "" },
  instagram: { blockType: "Text" as const, defaultValue: "" },
};

const defaultManagement: any[] = [];

const defaultSupervision: any[] = [];

const extractionCache = new Map<string, RGB>();

const getImgSrc = (image: any) => {
  if (!image) return "";
  return typeof image === "string" ? image : image.src || "";
};

export default function BoardSection() {
  const { isAdmin, setActiveBlock } = useCmsContext();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<
    "management" | "supervision"
  >("management");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);

  const managementBlocks = useCmsBlock("board.management", {
    blockType: "List",
    defaultValue: [],
  });
  const supervisionBlocks = useCmsBlock("board.supervision", {
    blockType: "List",
    defaultValue: [],
  });

  const managementList = Array.isArray(managementBlocks.value)
    ? managementBlocks.value
    : defaultManagement;
  const supervisionList = Array.isArray(supervisionBlocks.value)
    ? supervisionBlocks.value
    : defaultSupervision;

  const currentMembers =
    selectedBoard === "management" ? managementList : supervisionList;

  const [boardColors, setBoardColors] = useState<Record<string, RGB>>({});

  const boardImageCacheKey = [...managementList, ...supervisionList]
    .map(
      (member) =>
        `${member.id || member.name}:${getImgSrc(member.image) || ""}`,
    )
    .join("|");

  useEffect(() => {
    let isActive = true;
    const loadColors = async () => {
      const newColors: Record<string, RGB> = {};
      const allMembers = [...managementList, ...supervisionList];
      await Promise.all(
        allMembers.map(async (member) => {
          const key = member.id || member.name;
          const imgSrc = getImgSrc(member.image);
          if (!imgSrc) {
            newColors[key] = { r: 139, g: 92, b: 246 };
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
            newColors[key] = { r: 139, g: 92, b: 246 };
          }
        }),
      );
      if (isActive) {
        setBoardColors(newColors);
      }
    };
    loadColors();
    return () => {
      isActive = false;
    };
  }, [boardImageCacheKey]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      transitionTimers.current.forEach(clearTimeout);
    };
  }, []);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll, { passive: true });
      setTimeout(checkScroll, 300);

      return () => {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [selectedBoard, currentMembers, isVisible, checkScroll]);

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

    const t1 = setTimeout(() => {
      setSelectedBoard(board);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "instant" });
      }

      const t2 = setTimeout(() => {
        setIsTransitioning(false);
        checkScroll();
      }, 50);
      transitionTimers.current.push(t2);
    }, 200);
    transitionTimers.current.push(t1);
  };

  const showAnimations = isMounted && isVisible;

  return (
    <section
      ref={sectionRef}
      id="kurul"
      className="scroll-mt-32 relative py-12 md:py-16"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeader title="Kurullarımız" isVisible={showAnimations} />

        <div
          className={cn(
            "flex justify-center mb-4 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8",
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
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 cursor-pointer",
                selectedBoard === "management"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80",
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
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 cursor-pointer",
                selectedBoard === "supervision"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80",
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
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <button
            onClick={() => scroll("left")}
            aria-label="Sola kaydır"
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 cursor-pointer"
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
            aria-label="Sağa kaydır"
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full border transition-all duration-500 hover:scale-110 cursor-pointer"
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
            className="flex gap-5 md:gap-8 overflow-x-auto scroll-smooth pb-12 pt-8 px-12 -mx-12 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {selectedBoard === "management" ? (
              <EditableList
                blockPath="board.management"
                itemSchema={{
                  id: { blockType: "Text", defaultValue: "" },
                  name: { blockType: "Text", defaultValue: "" },
                  position: { blockType: "Text", defaultValue: "" },
                  image: {
                    blockType: "Image",
                    defaultValue: { src: "", alt: "" },
                  },
                  linkedin: { blockType: "Text", defaultValue: "" },
                  github: { blockType: "Text", defaultValue: "" },
                  twitter: { blockType: "Text", defaultValue: "" },
                  instagram: { blockType: "Text", defaultValue: "" },
                }}
                defaultValue={[]}
              >
                {(member, index) => {
                  const socialLinks = [
                    { icon: Linkedin, url: member.linkedin, label: "LinkedIn" },
                    { icon: Github, url: member.github, label: "GitHub" },
                    { icon: Twitter, url: member.twitter, label: "Twitter" },
                    {
                      icon: Instagram,
                      url: member.instagram,
                      label: "Instagram",
                    },
                  ].filter((link) => link.url);

                  const color = boardColors[member.id || member.name] || {
                    r: 139,
                    g: 92,
                    b: 246,
                  };
                  const rgbVars = `${color.r}, ${color.g}, ${color.b}`;

                  return (
                    <div
                      key={member.id || index}
                      className={cn(
                        "relative shrink-0 w-70 md:w-[320px] transition-all ease-out",
                        showAnimations && !isTransitioning
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-12",
                      )}
                      style={{
                        transitionDuration: isTransitioning ? "150ms" : "700ms",
                        transitionDelay: isTransitioning
                          ? "0ms"
                          : `${200 + index * 80}ms`,
                        isolation: "isolate",
                      }}
                    >
                      <div
                        onClick={() => {
                          if (isAdmin) {
                            setActiveBlock("board.management");
                          }
                        }}
                        className="glass-panel group relative rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer aspect-3/4 z-10 hover:z-20 hover:-translate-y-3 hover:scale-[1.02]"
                        style={
                          {
                            "--c-rgb": rgbVars,
                          } as React.CSSProperties
                        }
                      >
                        <div className="pointer-events-none absolute inset-0 translate-x-[-150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 bg-linear-to-br from-purple-500/10 to-transparent" />

                        {getImgSrc(member.image) ? (
                          <Image
                            src={getImgSrc(member.image)}
                            loading="lazy"
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 brightness-90"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 to-indigo-950/40 flex items-center justify-center">
                            <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">
                              Fotoğraf Yok
                            </span>
                          </div>
                        )}

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
                                className="liquid-glass p-2.5 rounded-full transition-all duration-300 hover:scale-110"
                                style={
                                  {
                                    "--c-rgb": rgbVars,
                                    transitionDelay: `${idx * 50}ms`,
                                  } as React.CSSProperties
                                }
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
                }}
              </EditableList>
            ) : (
              <EditableList
                blockPath="board.supervision"
                itemSchema={{
                  id: { blockType: "Text", defaultValue: "" },
                  name: { blockType: "Text", defaultValue: "" },
                  position: { blockType: "Text", defaultValue: "" },
                  image: {
                    blockType: "Image",
                    defaultValue: { src: "", alt: "" },
                  },
                  linkedin: { blockType: "Text", defaultValue: "" },
                  github: { blockType: "Text", defaultValue: "" },
                  twitter: { blockType: "Text", defaultValue: "" },
                  instagram: { blockType: "Text", defaultValue: "" },
                }}
                defaultValue={[]}
              >
                {(member, index) => {
                  const socialLinks = [
                    { icon: Linkedin, url: member.linkedin, label: "LinkedIn" },
                    { icon: Github, url: member.github, label: "GitHub" },
                    { icon: Twitter, url: member.twitter, label: "Twitter" },
                    {
                      icon: Instagram,
                      url: member.instagram,
                      label: "Instagram",
                    },
                  ].filter((link) => link.url);

                  const color = boardColors[member.id || member.name] || {
                    r: 139,
                    g: 92,
                    b: 246,
                  };
                  const rgbVars = `${color.r}, ${color.g}, ${color.b}`;

                  return (
                    <div
                      key={member.id || index}
                      className={cn(
                        "relative shrink-0 w-70 md:w-[320px] transition-all ease-out",
                        showAnimations && !isTransitioning
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-12",
                      )}
                      style={{
                        transitionDuration: isTransitioning ? "150ms" : "700ms",
                        transitionDelay: isTransitioning
                          ? "0ms"
                          : `${200 + index * 80}ms`,
                        isolation: "isolate",
                      }}
                    >
                      <div
                        onClick={() => {
                          if (isAdmin) {
                            setActiveBlock("board.supervision");
                          }
                        }}
                        className="glass-panel group relative rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer aspect-3/4 z-10 hover:z-20 hover:-translate-y-3 hover:scale-[1.02]"
                        style={
                          {
                            "--c-rgb": rgbVars,
                          } as React.CSSProperties
                        }
                      >
                        <div className="pointer-events-none absolute inset-0 translate-x-[-150%] -skew-x-12 bg-linear-to-r from-transparent via-white/8 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[150%] z-30" />

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 bg-linear-to-br from-purple-500/10 to-transparent" />

                        {getImgSrc(member.image) ? (
                          <Image
                            src={getImgSrc(member.image)}
                            loading="lazy"
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 brightness-90"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 to-indigo-950/40 flex items-center justify-center">
                            <span className="text-white/20 text-xs font-semibold uppercase tracking-wider">
                              Fotoğraf Yok
                            </span>
                          </div>
                        )}

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
                                className="liquid-glass p-2.5 rounded-full transition-all duration-300 hover:scale-110"
                                style={
                                  {
                                    "--c-rgb": rgbVars,
                                    transitionDelay: `${idx * 50}ms`,
                                  } as React.CSSProperties
                                }
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
                }}
              </EditableList>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4",
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
