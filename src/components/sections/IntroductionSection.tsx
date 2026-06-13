"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { cn } from "@/lib/utils";

export default function IntroductionSection() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.3);

  return (
    <section
      ref={sectionRef}
      id="hakkimizda"
      className="scroll-mt-32 max-w-7xl py-12 md:py-16 overflow-hidden text-center space-y-6"
    >
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}
      >
        <span className="inline-block bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          Yıldız Teknik Üniversitesi'nin
        </span>
        <br />
        <span
          className={cn(
            "inline-block pb-2 bg-linear-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "150ms" }}
        >
          En Aktif Bilgisayar Bilimleri Durağı!
        </span>
      </h2>

      <p
        className={cn(
          "text-sm md:text-base lg:text-lg text-white/70 leading-relaxed max-w-3xl mx-auto transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
        style={{ transitionDelay: "300ms" }}
      >
        SKY LAB; Ar-Ge, proje ve iş geliştirme ekipleriyle YTÜ bünyesindeki en
        dinamik ve etkin kulüplerden biridir.
      </p>

      <SectionDivider isVisible={isVisible} delay={450} className="pt-4" />
    </section>
  );
}
