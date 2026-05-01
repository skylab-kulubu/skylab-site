"use client";

import Image from "next/image";
import { Twitter, Instagram, Linkedin, Github, Youtube } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Footer() {
  const { ref: footerRef, isVisible } = useScrollReveal(0.1);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: "https://x.com/skylabkulubu",
      hoverBg: "hover:bg-indigo-500/10",
      hoverBorder: "hover:border-indigo-400/50",
      hoverText: "group-hover:text-indigo-400",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/ytuskylab",
      hoverBg: "hover:bg-pink-500/10",
      hoverBorder: "hover:border-pink-400/50",
      hoverText: "group-hover:text-pink-400",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://www.youtube.com/channel/UCF_qBKpUnM3X_C3L-gLEO4A",
      hoverBg: "hover:bg-red-500/10",
      hoverBorder: "hover:border-red-400/50",
      hoverText: "group-hover:text-red-400",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/company/ytuskylab/",
      hoverBg: "hover:bg-blue-500/10",
      hoverBorder: "hover:border-blue-400/50",
      hoverText: "group-hover:text-blue-400",
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/skylab-kulubu",
      hoverBg: "hover:bg-purple-500/10",
      hoverBorder: "hover:border-purple-400/50",
      hoverText: "group-hover:text-purple-400",
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
    <footer
      ref={footerRef}
      className="relative w-full bg-slate-900/40 backdrop-blur-2xl border-t border-white/10 overflow-hidden"
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent transition-all duration-1000",
          isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
        )}
      />
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 pointer-events-none transition-all duration-1500",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
          transitionDelay: "200ms",
        }}
      />

      <div className="relative max-w-7xl mx-auto py-16 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-slate-300">
          <div
            className={cn(
              "space-y-6 lg:col-span-1 transition-all duration-700 ease-out",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
          >
            <div className="h-16 flex items-center overflow-hidden">
              <Image
                src="/img/skylab-text-logo.svg"
                alt="Sky Lab"
                width={160}
                height={64}
                className="h-16 w-auto object-contain"
                style={{ width: "auto", height: "auto" }}
                priority={false}
                loading="lazy"
              />
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
              "flex flex-col items-start lg:items-end justify-start transition-all duration-700 ease-out",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
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
                      "group relative w-11 h-11 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 overflow-hidden",
                      social.hoverBg,
                      social.hoverBorder,
                      isVisible
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75",
                    )}
                    style={{ transitionDelay: `${400 + index * 60}ms` }}
                    aria-label={social.name}
                  >
                    <div
                      className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent transition-opacity duration-300"
                      style={{ opacity: isHovered ? 1 : 0 }}
                    />
                    <Icon
                      className={cn(
                        "w-5 h-5 text-slate-400 transition-all duration-300 relative z-10",
                        social.hoverText,
                        isHovered && "scale-110",
                      )}
                    />
                    <div
                      className="absolute inset-0 rounded-xl transition-all duration-500"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
                        transform: isHovered ? "scale(1.5)" : "scale(0)",
                        opacity: isHovered ? 0 : 1,
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
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
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
  );
}
