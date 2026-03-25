"use client";

import { BookOpen, Network, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

export default function FeaturesSection() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.2);

  const features = [
    {
      icon: BookOpen,
      title: "Akran Öğrenmesi",
      description:
        "Workshop ve bootcamp programları ile temelden ileri seviyeye kadar eğitimler sunuyoruz.",
      color: "blue",
    },
    {
      icon: Network,
      title: "Networking",
      description:
        "Sektör-öğrenci buluşmaları ve seminerlerle profesyonel ağınızı genişletiyoruz.",
      color: "purple",
    },
    {
      icon: Users,
      title: "Öğren-Uygula",
      description:
        "Dinamik proje ekiplerimizle teorik bilgiyi pratiğe döküyoruz.",
      color: "pink",
    },
  ];

  const colorClasses = {
    blue: {
      glow: "bg-blue-500/20",
      icon: "text-blue-300",
      iconGlow: "drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]",
      line: "via-blue-400",
      lineShadow: "group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]",
    },
    purple: {
      glow: "bg-purple-500/20",
      icon: "text-purple-300",
      iconGlow: "drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]",
      line: "via-purple-400",
      lineShadow: "group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]",
    },
    pink: {
      glow: "bg-pink-500/20",
      icon: "text-pink-300",
      iconGlow: "drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]",
      line: "via-pink-400",
      lineShadow: "group-hover:drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]",
    },
  };

  return (
    <section
      ref={sectionRef}
      id="ozellikler"
      className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16"
    >
      <div
        className={cn(
          "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
          <span className="bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Neler Katıyoruz?
          </span>
        </h2>
      </div>

      <div className="relative">
        <div
          className={cn(
            "hidden lg:block absolute left-0 top-0 h-full w-px bg-linear-to-b from-transparent via-white/20 to-transparent transition-all duration-1000",
            isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          )}
          style={{ transitionDelay: "200ms", transformOrigin: "top" }}
        />

        <div
          className={cn(
            "hidden lg:block absolute right-0 top-0 h-full w-px bg-linear-to-b from-transparent via-white/20 to-transparent transition-all duration-1000",
            isVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
          )}
          style={{ transitionDelay: "200ms", transformOrigin: "top" }}
        />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-0 py-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors =
              colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <div
                key={index}
                className={cn(
                  "relative group transition-all duration-700 ease-out h-full",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-16"
                )}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                <div className="flex flex-col h-full px-4 md:px-6 lg:px-12">
                  <div className="text-center space-y-4">
                    <div
                      className={cn(
                        "flex justify-center mb-6 transition-all duration-700 ease-out",
                        isVisible
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      )}
                      style={{ transitionDelay: `${400 + index * 150}ms` }}
                    >
                      <div className="relative">
                        <div
                          className={`absolute -inset-4 ${colors.glow} rounded-full blur-2xl opacity-50 group-hover:opacity-100 group-hover:blur-3xl transition-all duration-700`}
                        />

                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <Icon
                            className={`w-10 h-10 ${colors.icon} ${colors.iconGlow} transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1`}
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>
                    </div>

                    <h3
                      className={cn(
                        "text-xl md:text-2xl font-bold text-white group-hover:text-white/90 transition-all duration-500",
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${500 + index * 150}ms` }}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={cn(
                        "text-sm md:text-base text-white/60 leading-relaxed group-hover:text-white/70 transition-all duration-500",
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${600 + index * 150}ms` }}
                    >
                      {feature.description}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "mt-auto pt-8 flex justify-center items-end transition-all duration-700",
                      isVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: `${700 + index * 150}ms` }}
                  >
                    <div
                      className={cn(
                        "h-0.5 rounded-full transition-all duration-700 ease-out",
                        "bg-linear-to-r from-transparent to-transparent",
                        colors.line,
                        "w-12 opacity-50",
                        "group-hover:w-48 group-hover:opacity-100",
                        colors.lineShadow
                      )}
                    />
                  </div>
                </div>

                {index < features.length - 1 && (
                  <div
                    className={cn(
                      "hidden md:block absolute top-0 right-0 h-full w-px bg-linear-to-b from-transparent via-white/20 to-transparent transition-all duration-1000",
                      isVisible
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0"
                    )}
                    style={{
                      transitionDelay: `${400 + index * 100}ms`,
                      transformOrigin: "center",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
