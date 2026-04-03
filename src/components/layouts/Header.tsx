"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { SkyLabLogo } from "@/components/ui/SkyLabLogo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Ana Sayfa", sectionId: "home" },
  { href: "/#hakkimizda", label: "Hakkımızda", sectionId: "hakkimizda" },
  { href: "/#ekipler", label: "Ekipler", sectionId: "ekipler" },
  { href: "/#kurul", label: "Kurullar", sectionId: "kurul" },
  { href: "/#etkinlikler", label: "Etkinlikler", sectionId: "etkinlikler" },
  { href: "/#siteler", label: "Siteler", sectionId: "siteler" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);

  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScrollSpy = () => {
      if (isProgrammaticScroll.current) return;

      const triggerLine = 140;

      const sectionElements = navLinks
        .map((link) =>
          link.sectionId ? document.getElementById(link.sectionId) : null
        )
        .filter((el): el is HTMLElement => el !== null);

      if (sectionElements.length === 0) return;

      let currentSection = "home";

      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine) {
          currentSection = el.id;
        }
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10;

      if (isAtBottom) {
        currentSection = sectionElements[sectionElements.length - 1].id;
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[0]) => {
    if (!link.sectionId) {
      setIsMobileMenuOpen(false);
      return;
    }

    if (pathname === "/") {
      e.preventDefault();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      isProgrammaticScroll.current = true;
      setActiveSection(link.sectionId);
      setIsMobileMenuOpen(false);

      if (link.sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(link.sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 1000);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const isActiveLink = (link: (typeof navLinks)[0]) => {
    if (pathname === "/" && link.sectionId)
      return activeSection === link.sectionId;
    return false;
  };

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 w-full h-16 sm:h-20 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full" />
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 sm:h-20 z-50">
        <div
          className="absolute inset-0 -z-20 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: isScrolled ? 0 : 1,
            background: "transparent",
            backdropFilter: "blur(0px)",
            WebkitBackdropFilter: "blur(0px)",
          }}
        />
        <div
          className="absolute inset-0 -z-20 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: isScrolled ? 1 : 0,
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 10, 30, 0.8) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), transparent)",
            opacity: isScrolled ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link
              href="/"
              onClick={(e) =>
                handleNavClick(e, {
                  href: "/",
                  label: "Home",
                  sectionId: "home",
                })
              }
              className="flex items-center h-full py-2"
            >
              <SkyLabLogo />
            </Link>
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <nav
                className="flex items-center gap-1 rounded-full p-1.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.2)",
                }}
              >
                {navLinks.map((link) => {
                  const isActive = isActiveLink(link);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link)}
                      className="relative group"
                    >
                      <div className="relative px-4 lg:px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300">
                        {!isActive && (
                          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="navbar-active"
                            className="absolute inset-0 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)",
                              boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        <span
                          className={`relative z-10 whitespace-nowrap transition-colors duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-white/60 group-hover:text-white"
                          }`}
                          style={{
                            WebkitFontSmoothing: "antialiased",
                            transform: "translateZ(0)",
                          }}
                        >
                          {link.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="hidden md:block w-30" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative p-2 rounded-xl transition-all duration-300 group"
              style={{
                background: isMobileMenuOpen
                  ? "rgba(168, 85, 247, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 md:hidden z-40"
              style={{
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />

            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed top-20 left-4 right-4 md:hidden z-50 origin-top"
              style={{ willChange: "transform, opacity" }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 30, 0.98) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    "0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

                <nav className="p-3">
                  {navLinks.map((link, index) => {
                    const isActive = isActiveLink(link);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <Link
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link)}
                          className="relative block p-3 rounded-xl transition-all duration-300 group overflow-hidden"
                          style={{
                            background: isActive
                              ? "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)"
                              : "transparent",
                            borderLeft: isActive
                              ? "2px solid rgba(168, 85, 247, 0.8)"
                              : "2px solid transparent",
                          }}
                        >
                          {!isActive && (
                            <div className="absolute inset-0 bg-white/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          )}

                          <span
                            className={`relative z-10 font-semibold text-sm uppercase tracking-wider transition-colors duration-300 ${
                              isActive
                                ? "text-white"
                                : "text-white/60 group-hover:text-white"
                            }`}
                            style={{
                              WebkitFontSmoothing: "antialiased",
                              transform: "translateZ(0)",
                            }}
                          >
                            {link.label}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="px-6 pb-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
