"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { teams, getTeamsByCategory, type Team } from "@/lib/data";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

export default function TeamsSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"ar-ge" | "sosyal">(
    "ar-ge"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isButtonHovering, setIsButtonHovering] = useState(false);

  const { ref: sectionRef, isVisible } = useScrollReveal(0.15);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredTeams = useMemo(
    () => getTeamsByCategory(activeCategory),
    [activeCategory]
  );

  const handleCategoryChange = (category: "ar-ge" | "sosyal") => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    const newTeams = getTeamsByCategory(category);
    if (newTeams.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedTeam(newTeams[0]);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    }
  };

  const handleTeamSelect = (team: Team) => {
    if (team.id !== selectedTeam.id) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedTeam(team);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    }
  };

  const showAnimations = isMounted && isVisible;

  return (
    <section
      ref={sectionRef}
      id="ekipler"
      className="scroll-mt-28 relative py-12 md:py-16"
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
            Ekiplerimiz
          </span>
        </h2>

        <div
          className={cn(
            "flex justify-center mb-10 md:mb-12 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
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
              onClick={() => handleCategoryChange("ar-ge")}
              className={cn(
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300",
                activeCategory === "ar-ge"
                  ? "text-white"
                  : "text-white/70 hover:text-white/80"
              )}
              style={
                activeCategory === "ar-ge"
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(168, 85, 247, 0.25)",
                    }
                  : {}
              }
            >
              Ar-Ge
            </button>
            <button
              onClick={() => handleCategoryChange("sosyal")}
              className={cn(
                "relative px-6 md:px-10 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300",
                activeCategory === "sosyal"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              style={
                activeCategory === "sosyal"
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(168, 85, 247, 0.25)",
                    }
                  : {}
              }
            >
              Sosyal
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex justify-center items-center gap-6 md:gap-10 lg:gap-12 mb-10 md:mb-12 flex-wrap transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          {filteredTeams.map((team, index) => {
            const isActive = selectedTeam.id === team.id;
            const isHovered = hoveredTeam === team.id;
            const showColor = isActive || isHovered;

            return (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                className={cn(
                  "relative group transition-all duration-700 cursor-pointer ease-out",
                  showAnimations
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75"
                )}
                style={{
                  width: "clamp(48px, 4vw, 64px)",
                  aspectRatio: "1",
                  transitionDelay: `${300 + index * 80}ms`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    background:
                      isActive || isHovered
                        ? "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)"
                        : "transparent",
                    filter: "blur(18px)",
                    opacity: isActive ? 1 : isHovered ? 0.7 : 0,
                    transform: isActive ? "scale(1.5)" : "scale(1.3)",
                    zIndex: 0,
                  }}
                />

                <div className="relative w-full h-full z-10 flex items-center justify-center">
                  <Image
                    src={team.logoWhite}
                    alt={team.name}
                    loading="lazy"
                    fill
                    className={cn(
                      "object-contain transition-all duration-500 ease-out",
                      showColor ? "opacity-0" : "opacity-100"
                    )}
                    priority={false}
                  />

                  <Image
                    src={team.logoColor}
                    alt={team.name}
                    loading="lazy"
                    fill
                    className={cn(
                      "object-contain transition-all duration-500 ease-out",
                      showColor ? "opacity-100" : "opacity-0"
                    )}
                    priority={false}
                  />
                </div>

                <div
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 pointer-events-none z-20"
                  style={{
                    width: isActive ? "6px" : "0px",
                    height: isActive ? "6px" : "0px",
                    background:
                      "linear-gradient(135deg, rgba(216, 180, 254, 0.9) 0%, rgba(168, 85, 247, 1) 100%)",
                    boxShadow: isActive
                      ? "0 0 24px rgba(168, 85, 247, 0.9)"
                      : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            "relative rounded-2xl md:rounded-3xl overflow-hidden group border transition-all duration-700 ease-out hover:scale-[1.01]",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(20, 20, 40, 0.4) 0%, rgba(10, 10, 30, 0.6) 100%)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 12px 48px rgba(0, 0, 0, 0.3)",
            transitionDelay: "400ms",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />
          <div
            className="pointer-events-none absolute blur-3xl transition-all duration-1000"
            style={{
              top: isTransitioning ? "50%" : "0%",
              right: isTransitioning ? "50%" : "0%",
              width: "200px",
              height: "200px",
              opacity: isTransitioning ? 0.3 : 0.4,
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute blur-3xl transition-all duration-1000"
            style={{
              bottom: isTransitioning ? "50%" : "0%",
              left: isTransitioning ? "50%" : "0%",
              width: "200px",
              height: "200px",
              opacity: isTransitioning ? 0.2 : 0.3,
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/8 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
          <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative px-6 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12 z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-14">
              <div
                className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 shrink-0 transition-all duration-500"
                style={{
                  transform: isTransitioning
                    ? "scale(0.85) rotate(-5deg)"
                    : "scale(1) rotate(0deg)",
                  opacity: isTransitioning ? 0.3 : 1,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 -z-10 scale-150 rounded-full bg-purple-500/40 blur-3xl transition-all duration-700",
                    !isTransitioning && "animate-pulse"
                  )}
                  style={{
                    opacity: isTransitioning ? 0.2 : 0.7,
                    animationDuration: "3s",
                  }}
                />

                <div className="relative w-full h-full z-10">
                  <Image
                    src={selectedTeam.logoColor}
                    alt={selectedTeam.name}
                    loading="lazy"
                    fill
                    className="object-contain"
                    style={{
                      filter: "drop-shadow(0 0 24px rgba(168, 85, 247, 0.3))",
                    }}
                    priority={false}
                  />
                </div>
              </div>
              <div
                className="flex-1 text-center md:text-left lg:text-right transition-all duration-500"
                style={{
                  transform: isTransitioning
                    ? "translateX(-20px)"
                    : "translateX(0)",
                  opacity: isTransitioning ? 0 : 1,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <h3
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 lg:mb-5"
                  style={{
                    textShadow: "0 0 20px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {selectedTeam.name}
                </h3>

                <p
                  className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed"
                  style={{
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {selectedTeam.description}
                </p>
                <div className="hidden md:flex mt-5 lg:mt-6 md:justify-start lg:justify-end">
                  <div
                    className="h-0.5 bg-linear-to-r from-transparent via-purple-400/60 to-transparent rounded-full transition-all duration-700"
                    style={{
                      width: isTransitioning ? "0px" : "80px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex justify-center mt-10 md:mt-12 transition-all duration-1000 ease-out",
            showAnimations
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "500ms" }}
        >
          <button
            onMouseEnter={() => setIsButtonHovering(true)}
            onMouseLeave={() => setIsButtonHovering(false)}
            onClick={() =>
              window.open("https://forms.yildizskylab.com/", "_blank")
            }
            className="group relative px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer hover:scale-[1.03]"
            style={{
              background: isButtonHovering
                ? "linear-gradient(180deg, rgba(65, 35, 120, 0.7) 0%, rgba(40, 20, 80, 0.8) 100%)"
                : "linear-gradient(180deg, rgba(45, 25, 90, 0.5) 0%, rgba(25, 15, 60, 0.6) 100%)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid",
              borderColor: isButtonHovering
                ? "rgba(168, 85, 247, 0.5)"
                : "rgba(255, 255, 255, 0.12)",
              boxShadow: isButtonHovering
                ? "inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 16px 48px rgba(139, 92, 246, 0.35)"
                : "inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 ease-in-out",
                isButtonHovering ? "translate-x-full opacity-100" : "opacity-0"
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-400/20 blur-2xl transition-all duration-500",
                isButtonHovering ? "opacity-80 scale-150" : "opacity-40"
              )}
            />
            <div
              className="pointer-events-none absolute -inset-3 rounded-xl md:rounded-2xl transition-all duration-500 -z-10"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
                filter: "blur(20px)",
                opacity: isButtonHovering ? 1 : 0,
              }}
            />
            <span
              className="relative z-10 text-white font-medium text-sm md:text-base tracking-wide transition-all duration-300"
              style={{
                textShadow: isButtonHovering
                  ? "0 0 12px rgba(255, 255, 255, 0.5)"
                  : "0 0 4px rgba(255, 255, 255, 0.1)",
              }}
            >
              Ekiplerimize Katılmak İstersen Tıkla!
            </span>
          </button>
        </div>
        <div
          className={cn(
            "pt-6 flex items-center justify-center gap-2 transition-all duration-1000 ease-out",
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
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-purple-400/60 transition-all duration-500",
              showAnimations ? "animate-pulse scale-100" : "scale-0"
            )}
            style={{
              animationDuration: "2s",
              boxShadow: "0 0 8px rgba(168, 85, 247, 0.6)",
              transitionDelay: "750ms",
            }}
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
