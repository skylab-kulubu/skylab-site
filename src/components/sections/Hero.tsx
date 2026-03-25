"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 350], [1, 0]);
  const translateY = useTransform(scrollY, [0, 350], [0, -40]);
  const pointerEvents = useTransform(scrollY, (v) =>
    v > 300 ? "none" : "auto"
  );

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const text = "SKY LAB";

  return (
    <motion.div
      style={{ opacity, y: translateY, pointerEvents }}
      className="relative flex flex-col items-center justify-center text-center px-6 sm:px-4 min-h-[35svh] w-full overflow-visible"
    >
      <div className="absolute inset-0 pointer-events-none select-none overflow-visible">
        <div className="absolute inset-[-50%] transition-opacity duration-1000 ease-in-out" />
      </div>

      <div className="flex flex-col items-center space-y-6 sm:space-y-8 select-none relative z-10 w-full max-w-4xl">
        <div
          className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted
              ? "translateY(0) scale(1)"
              : "translateY(-20px) scale(0.9)",
            transition: "0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
          }}
        >
          <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-gray-200">
            YILDIZ TEKNİK ÜNİVERSİTESİ
          </span>
        </div>

        <h1
          className="font-black leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          style={{
            fontSize: "clamp(3rem, 15vw, 10rem)",
            letterSpacing: "-0.025em",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.3s",
            padding: "0 0.1em",
          }}
        >
          <span className="inline-flex justify-center items-center">
            {text.split("").map((char, idx) => (
              <span
                key={idx}
                className="inline-block bg-linear-to-b from-white via-white/90 to-gray-400/60 bg-clip-text"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted
                    ? "translateY(0) scale(1) rotateX(0deg)"
                    : "translateY(40px) scale(0.8) rotateX(-30deg)",
                  transition: `0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    0.4 + idx * 0.08
                  }s`,
                  marginRight: char === " " ? "0.15em" : "0",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  WebkitBackfaceVisibility: "hidden",
                  willChange: "transform, opacity",
                  padding: "0 0.02em",
                  lineHeight: "1.2",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </h1>

        <div className="flex flex-col items-center">
          <h2
            className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-gray-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-4 whitespace-nowrap"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s",
            }}
          >
            Bilgisayar Bilimleri Kulübü
          </h2>

          <div
            className="h-px sm:h-0.5 rounded-full bg-linear-to-r from-transparent via-purple-400/50 to-transparent mt-3 sm:mt-5"
            style={{
              width: mounted ? "8rem" : "0",
              opacity: mounted ? 0.8 : 0,
              transition: "1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.3s",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
