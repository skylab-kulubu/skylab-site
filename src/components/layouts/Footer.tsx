"use client";

import Image from "next/image";
import {
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
} from "@/components/ui/BrandIcons";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { useState } from "react";
import FooterEmblem from "./FooterEmblem";
import {
  SKYLAB_LOGO_CENTER,
  SKYLAB_LOGO_PATH,
} from "@/components/ui/skylab-logo-path";

const EMBLEM_SIZE = 176;
const VB_PAD = 60;
const SCALE = EMBLEM_SIZE / 600;
const NOTCH_STROKE = 60;
const RIM_WIDTH = 9;
const VB_W = 600 + 2 * VB_PAD;
const VB_X = SKYLAB_LOGO_CENTER.x - 300 - VB_PAD;
const VB_Y = SKYLAB_LOGO_CENTER.y - 280 - VB_PAD;
const RIM_H = 280 + VB_PAD;
const MASK_W = VB_W * SCALE;
const MASK_H = (560 + 2 * VB_PAD) * SCALE;
const MASK_TOP = -(280 + VB_PAD) * SCALE;
const EMBLEM_MASK_SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${VB_X} ${VB_Y} ${VB_W} ${560 + 2 * VB_PAD}'><path d='${SKYLAB_LOGO_PATH}' fill='black' stroke='black' stroke-width='${NOTCH_STROKE}' stroke-linejoin='round' stroke-linecap='round'/></svg>`,
);
const notchMask: React.CSSProperties = {
  maskImage: `linear-gradient(#000,#000), url("data:image/svg+xml,${EMBLEM_MASK_SVG}")`,
  maskSize: `100% 100%, ${MASK_W}px ${MASK_H}px`,
  maskPosition: `0 0, 50% ${MASK_TOP}px`,
  maskRepeat: "no-repeat",
  maskComposite: "subtract",
};

export default function Footer() {
  const { ref: footerRef, isVisible } = useScrollReveal(0.1);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: "https://x.com/skylabkulubu",
      rgb: "129, 140, 248",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/ytuskylab",
      rgb: "244, 114, 182",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://www.youtube.com/channel/UCF_qBKpUnM3X_C3L-gLEO4A",
      rgb: "248, 113, 113",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/company/ytuskylab/",
      rgb: "96, 165, 250",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/skylab-kulubu",
      rgb: "192, 132, 252",
    },
  ];

  const footerLinks = {
    club: [
      { href: "/", label: "Ana Sayfa", external: false },
      { href: "/#hakkimizda", label: "Hakkımızda", external: false },
      { href: "/#ekipler", label: "Ekiplerimiz", external: false },
      { href: "/#kurul", label: "Kurullarımız", external: false },
    ],
    explore: [
      { href: "/#etkinlikler", label: "Etkinlikler", external: false },
      { href: "/#siteler", label: "Siteler", external: false },
      {
        href: "mailto:info@yildizskylab.com",
        label: "İletişim",
        external: false,
      },
      {
        href: "https://skyl.app/kvkk-metni",
        label: "KVKK Metni",
        external: true,
      },
    ],
  };

  return (
    <div className="relative">
      <FooterEmblem />
      <svg
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        width={MASK_W}
        height={RIM_H * SCALE}
        viewBox={`${VB_X} ${SKYLAB_LOGO_CENTER.y} ${VB_W} ${RIM_H}`}
      >
        <defs>
          <mask
            id="notchRim"
            maskUnits="userSpaceOnUse"
            x={VB_X}
            y={SKYLAB_LOGO_CENTER.y}
            width={VB_W}
            height={RIM_H}
          >
            <rect
              x={VB_X}
              y={SKYLAB_LOGO_CENTER.y}
              width={VB_W}
              height={RIM_H}
              fill="white"
            />
            <path
              d={SKYLAB_LOGO_PATH}
              fill="black"
              stroke="black"
              strokeWidth={NOTCH_STROKE}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </mask>
        </defs>
        <path
          d={SKYLAB_LOGO_PATH}
          fill="none"
          stroke="rgba(113,118,246,0.55)"
          strokeWidth={NOTCH_STROKE + RIM_WIDTH}
          strokeLinejoin="round"
          strokeLinecap="round"
          mask="url(#notchRim)"
        />
      </svg>
      <footer
        ref={footerRef}
        style={{
          ...notchMask,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 45%, rgba(255, 255, 255, 0.01) 60%, rgba(255, 255, 255, 0.03) 100%), rgba(12, 14, 34, 0.28)",
          borderTop: "1px solid rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
        className="relative w-full overflow-hidden"
      >
        <div
          className={cn(
            "absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent transition-all duration-1000",
            isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
          )}
        />
        <div className="relative max-w-7xl mx-auto pt-28 pb-16 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-slate-300">
            <div
              className={cn(
                "space-y-6 lg:col-span-1 transition-all duration-700 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
            >
              <div className="h-16 flex flex-col justify-center">
                <span className="text-2xl font-bold tracking-[0.2em] text-white">
                  SKY LAB
                </span>
                <span className="text-sm text-slate-400 mt-1">
                  Bilgisayar Bilimleri Kulübü
                </span>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed max-w-xs transition-all duration-700",
                  isVisible
                    ? "opacity-80 translate-y-0"
                    : "opacity-0 translate-y-4",
                )}
                style={{ transitionDelay: "200ms" }}
              >
                Yıldız Teknik Üniversitesi Bilgisayar Bilimleri Kulübü olarak
                teknoloji ve yenilikçilik alanında arkadaşlarımıza destek
                veriyoruz.
              </p>
            </div>

            {[
              {
                title: "Kulübümüz",
                links: footerLinks.club,
                delay: 150,
                titleDelay: 250,
                listStartDelay: 300,
              },
              {
                title: "Keşfet",
                links: footerLinks.explore,
                delay: 200,
                titleDelay: 350,
                listStartDelay: 400,
              },
            ].map((group) => (
              <div
                key={group.title}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8",
                )}
                style={{ transitionDelay: `${group.delay}ms` }}
              >
                <h3
                  className={cn(
                    "text-white font-semibold mb-6 uppercase tracking-widest text-xs transition-all duration-500",
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4",
                  )}
                  style={{ transitionDelay: `${group.titleDelay}ms` }}
                >
                  {group.title}
                </h3>
                <ul className="space-y-4 text-sm font-medium">
                  {group.links.map((link, index) => (
                    <li
                      key={link.label}
                      className={cn(
                        "transition-all duration-500",
                        isVisible
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-4",
                      )}
                      style={{
                        transitionDelay: `${group.listStartDelay + index * 50}ms`,
                      }}
                    >
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group inline-flex items-center gap-2 hover:text-indigo-400 transition-colors"
                      >
                        <span className="w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-3" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div
              className={cn(
                "flex flex-col items-start lg:items-end justify-start transition-opacity duration-700 ease-out",
                isVisible ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDelay: "250ms" }}
            >
              <div className="h-16 flex items-center mb-6 overflow-hidden">
                <Image
                  src="/img/ytulogo.png"
                  alt="Yıldız Teknik Üniversitesi"
                  width={64}
                  height={64}
                  className="h-16 w-auto object-contain"
                  style={{ width: "auto", height: "auto" }}
                  loading="lazy"
                />
              </div>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  const isHovered = hoveredSocial === social.name;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHoveredSocial(social.name)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      className={cn(
                        "group relative w-11 h-11 rounded-xl bg-white/6 backdrop-blur-xl backdrop-saturate-150 border flex items-center justify-center transition-all duration-300 overflow-hidden hover:scale-110 hover:-translate-y-0.5",
                        isVisible
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75",
                      )}
                      style={{
                        transitionDelay: `${400 + index * 60}ms`,
                        borderColor: isHovered
                          ? `rgba(${social.rgb}, 0.55)`
                          : "rgba(255, 255, 255, 0.1)",
                        boxShadow: isHovered
                          ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 20px rgba(${social.rgb}, 0.35)`
                          : "inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                      aria-label={social.name}
                    >
                      <div
                        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, rgba(${social.rgb}, 0.5) 0%, rgba(${social.rgb}, 0.12) 55%, transparent 80%)`,
                          opacity: isHovered ? 1 : 0,
                        }}
                      />
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-all duration-300 relative z-10",
                          isHovered ? "text-white scale-110" : "text-slate-400",
                        )}
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 8px rgba(${social.rgb}, 0.9))`
                            : "none",
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: "500ms" }}
          >
            <div
              className={cn(
                "absolute left-6 right-6 -mt-8 h-px bg-linear-to-r from-transparent via-white/10 to-transparent transition-all duration-1000",
                isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
              )}
              style={{ transitionDelay: "600ms" }}
            />

            <div
              className={cn(
                "text-xs text-slate-500 font-medium transition-all duration-500",
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4",
              )}
              style={{ transitionDelay: "650ms" }}
            >
              © 2026 SKY LAB. Tüm hakları saklıdır.
            </div>
            <div
              className={cn(
                "flex justify-end transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
              )}
              style={{ transitionDelay: "700ms" }}
            >
              <div className="flex items-center text-xs text-slate-500/60 h-5">
                <span className="font-light mr-1.5 selection:none">by</span>

                <a
                  href="https://github.com/kanekalp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center h-full transition-all duration-500"
                >
                  <div className="grid transition-[grid-template-columns] duration-500 ease-in-out grid-cols-[0fr] group-hover:grid-cols-[1fr]">
                    <span className="overflow-hidden opacity-0 group-hover:opacity-100 group-hover:pr-1.5 text-indigo-400 text-[10px] whitespace-nowrap flex items-center transition-all duration-500">
                      ✎
                    </span>
                  </div>

                  <span className="font-semibold text-slate-400 transition-colors duration-300 group-hover:text-indigo-400 whitespace-nowrap flex items-center">
                    Kaan Necip Kalp
                  </span>

                  <div className="grid transition-[grid-template-columns] duration-500 ease-in-out grid-cols-[0fr] group-hover:grid-cols-[1fr]">
                    <span className="overflow-hidden opacity-0 group-hover:opacity-100 group-hover:pl-1.5 text-indigo-400 text-[10px] whitespace-nowrap flex items-center transition-all duration-500">
                      {`</>`}
                    </span>
                  </div>

                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-100 h-25 pointer-events-none transition-all duration-1500",
            isVisible ? "opacity-100" : "opacity-0",
          )}
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(168, 85, 247, 0.05) 0%, transparent 70%)",
            transitionDelay: "400ms",
          }}
        />
      </footer>
    </div>
  );
}
