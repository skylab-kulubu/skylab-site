"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface UniverseFallbackProps {
  seed?: number;
  starSize?: number;
  density?: number;
}

const TWO_PI = Math.PI * 2;
const BG_R = 4;
const BG_G = 3;
const BG_B = 14;
const BG_FILL = `rgb(${BG_R},${BG_G},${BG_B})`;
const CULL_THRESHOLD = 0.05;
const DEBOUNCE_MS = 200;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hslToRgbStr(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let cr = 0,
    cg = 0,
    cb = 0;
  const sec = (h * 6) | 0;
  if (sec === 0) {
    cr = c;
    cg = x;
  } else if (sec === 1) {
    cr = x;
    cg = c;
  } else if (sec === 2) {
    cg = c;
    cb = x;
  } else if (sec === 3) {
    cg = x;
    cb = c;
  } else if (sec === 4) {
    cr = x;
    cb = c;
  } else {
    cr = c;
    cb = x;
  }
  return `rgb(${((cr + m) * 255) | 0},${((cg + m) * 255) | 0},${
    ((cb + m) * 255) | 0
  })`;
}

function hslToRgbArr(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let cr = 0,
    cg = 0,
    cb = 0;
  const sec = (h * 6) | 0;
  if (sec === 0) {
    cr = c;
    cg = x;
  } else if (sec === 1) {
    cr = x;
    cg = c;
  } else if (sec === 2) {
    cg = c;
    cb = x;
  } else if (sec === 3) {
    cg = x;
    cb = c;
  } else if (sec === 4) {
    cr = x;
    cb = c;
  } else {
    cr = c;
    cb = x;
  }
  return [((cr + m) * 255) | 0, ((cg + m) * 255) | 0, ((cb + m) * 255) | 0];
}

interface Cloud {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  driftX: number;
  driftY: number;
  driftSpeed: number;
  phase: number;
  gradStops: string[];
  driftGradStopBase: string;
  driftGradStopEdge: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  haloRadius: number;
  hasHalo: boolean;
  opacity: number;
  speed: number;
  phase: number;
  color: string;
}

export default function UniverseFallback({
  seed = 42,
  starSize = 1.0,
  density = 1.0,
}: UniverseFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const dataRef = useRef<{
    clouds: Cloud[];
    stars: Star[];
    staticNebulaBuf: HTMLCanvasElement | null;
    maskBuf: HTMLCanvasElement | null;
    width: number;
    height: number;
    scale: number;
    transitionH: number;
  }>({
    clouds: [],
    stars: [],
    staticNebulaBuf: null,
    maskBuf: null,
    width: 0,
    height: 0,
    scale: 0.2,
    transitionH: 0,
  });

  const buildScene = useCallback(
    (width: number, height: number) => {
      const d = dataRef.current;
      d.width = width;
      d.height = height;
      const isMobile = width < 768;
      d.scale = isMobile ? 0.15 : 0.2;

      d.transitionH = Math.max(height * 1.5, 1000);

      const bw = Math.max(1, (width * d.scale) | 0);
      const bh = Math.max(1, (d.transitionH * d.scale) | 0);

      if (!d.staticNebulaBuf)
        d.staticNebulaBuf = document.createElement("canvas");
      d.staticNebulaBuf.width = bw;
      d.staticNebulaBuf.height = bh;

      const rand = seededRandom(seed + 100);
      const cloudCount = isMobile ? 3 : 5;
      d.clouds = [];

      const sCtx = d.staticNebulaBuf.getContext("2d", { alpha: false });
      if (sCtx) {
        sCtx.fillStyle = BG_FILL;
        sCtx.fillRect(0, 0, bw, bh);
        sCtx.globalCompositeOperation = "screen";

        for (let i = 0; i < cloudCount; i++) {
          const hue = 180 + rand() * 160;
          const sat = 0.65 + rand() * 0.35;
          const lit = 0.35 + rand() * 0.25;
          const [r, g, b] = hslToRgbArr(hue / 360, sat, lit);
          const alpha = 0.25 + rand() * 0.2;
          const cx = (-0.2 + rand() * 0.8) * width;
          const cy = (-0.2 + rand() * 0.6) * d.transitionH;
          const rx = (0.25 + rand() * 0.25) * width;
          const ry = (0.3 + rand() * 0.25) * d.transitionH;

          const s0 = `rgba(${r},${g},${b},${alpha})`;
          const s1 = `rgba(${r},${g},${b},${alpha * 0.7})`;
          const s2 = `rgba(${r},${g},${b},${alpha * 0.35})`;
          const dr = Math.max(0, r - 20);
          const dg = Math.max(0, g - 15);
          const db = Math.max(0, b - 10);
          const s3 = `rgba(${dr},${dg},${db},${alpha * 0.15})`;
          const s4 = `rgba(${r},${g},${b},0)`;

          d.clouds.push({
            cx,
            cy,
            rx,
            ry,
            r,
            g,
            b,
            alpha,
            driftX: (rand() - 0.5) * 0.03,
            driftY: (rand() - 0.5) * 0.02,
            driftSpeed: 0.015 + rand() * 0.015,
            phase: rand() * TWO_PI,
            gradStops: [s0, s1, s2, s3, s4],
            driftGradStopBase: `rgba(${r},${g},${b},`,
            driftGradStopEdge: `rgba(${r},${g},${b},0)`,
          });

          const scx = (cx * d.scale) | 0;
          const scy = (cy * d.scale) | 0;
          const srx = (rx * d.scale) | 0;
          const sry = (ry * d.scale) | 0;
          const maxR = srx > sry ? srx : sry;
          if (maxR < 1) continue;

          const grad = sCtx.createRadialGradient(scx, scy, 0, scx, scy, maxR);
          grad.addColorStop(0, s0);
          grad.addColorStop(0.3, s1);
          grad.addColorStop(0.55, s2);
          grad.addColorStop(0.75, s3);
          grad.addColorStop(1, s4);

          sCtx.save();
          sCtx.translate(scx, scy);
          sCtx.scale(1, sry / Math.max(srx, 1));
          sCtx.translate(-scx, -scy);
          sCtx.fillStyle = grad;
          sCtx.beginPath();
          sCtx.arc(scx, scy, maxR, 0, TWO_PI);
          sCtx.fill();
          sCtx.restore();
        }

        sCtx.globalCompositeOperation = "multiply";
        const dustRand = seededRandom(seed + 500);
        const dustCount = isMobile ? 2 : 3;
        for (let i = 0; i < dustCount; i++) {
          const dcx = ((0.1 + dustRand() * 0.6) * width * d.scale) | 0;
          const dcy = ((0.1 + dustRand() * 0.5) * d.transitionH * d.scale) | 0;
          const drx = ((0.2 + dustRand() * 0.3) * width * d.scale) | 0;
          const dry =
            ((0.04 + dustRand() * 0.08) * d.transitionH * d.scale) | 0;
          const maxR = drx > dry ? drx : dry;
          if (maxR < 1) continue;

          const dAlpha = 0.3 + dustRand() * 0.2;
          const grad = sCtx.createRadialGradient(dcx, dcy, 0, dcx, dcy, maxR);
          grad.addColorStop(0, `rgba(2,1,8,${dAlpha})`);
          grad.addColorStop(0.7, "rgba(2,1,8,0)");
          grad.addColorStop(1, "rgba(2,1,8,0)");

          sCtx.save();
          sCtx.translate(dcx, dcy);
          sCtx.scale(1, dry / Math.max(drx, 1));
          sCtx.translate(-dcx, -dcy);
          sCtx.fillStyle = grad;
          sCtx.beginPath();
          sCtx.arc(dcx, dcy, maxR, 0, TWO_PI);
          sCtx.fill();
          sCtx.restore();
        }

        sCtx.globalCompositeOperation = "lighter";
        const gcx = (bw * 0.45) | 0;
        const gcy = (bh * 0.35) | 0;
        const gr = (Math.max(bw, bh) * 0.4) | 0;
        const coreGrad = sCtx.createRadialGradient(gcx, gcy, 0, gcx, gcy, gr);
        coreGrad.addColorStop(0, "rgba(255,245,250,0.12)");
        coreGrad.addColorStop(0.3, "rgba(255,230,240,0.06)");
        coreGrad.addColorStop(1, "rgba(255,220,235,0)");
        sCtx.fillStyle = coreGrad;
        sCtx.fillRect(0, 0, bw, bh);
        sCtx.globalCompositeOperation = "source-over";
      }

      if (!d.maskBuf) d.maskBuf = document.createElement("canvas");
      d.maskBuf.width = width | 0;
      d.maskBuf.height = d.transitionH | 0;
      const mCtx = d.maskBuf.getContext("2d", { alpha: true });
      if (mCtx) {
        mCtx.clearRect(0, 0, width, d.transitionH);

        const fadeStart = d.transitionH * 0.4;
        const fadeGrad = mCtx.createLinearGradient(
          0,
          fadeStart,
          0,
          d.transitionH
        );
        fadeGrad.addColorStop(0, `rgba(${BG_R},${BG_G},${BG_B},0)`);
        fadeGrad.addColorStop(0.6, `rgba(${BG_R},${BG_G},${BG_B},0.8)`);
        fadeGrad.addColorStop(1, `rgba(${BG_R},${BG_G},${BG_B},1)`);

        mCtx.fillStyle = fadeGrad;
        mCtx.fillRect(0, fadeStart, width, d.transitionH - fadeStart);
      }

      const starRand = seededRandom(seed);
      const starWrapArea = height * 3;
      const area = (width * starWrapArea) / 1000000;
      const count = (160 * density * Math.max(1, area)) | 0;
      d.stars = [];

      for (let i = 0; i < count; i++) {
        const isLarge = starRand() > 0.95;
        const hue = 180 + starRand() * 160;
        const color = hslToRgbStr(
          hue / 360,
          isLarge ? 0.8 : 0,
          isLarge ? 0.9 : 1.0
        );
        const sz =
          (isLarge ? 2.5 + starRand() : 0.8 + starRand() * 1.2) * starSize;

        d.stars.push({
          x: starRand() * width,
          y: starRand() * starWrapArea,
          radius: sz * 0.5,
          haloRadius: sz * 1.5,
          hasHalo: sz > 2,
          opacity: isLarge ? 1.0 : 0.3 + starRand() * 0.6,
          speed: 2 + starRand() * 3,
          phase: starRand() * TWO_PI,
          color,
        });
      }
    },
    [seed, starSize, density]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let alive = true;
    let debounceTimer = 0;

    const doResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = (rect.width * dpr) | 0;
      canvas.height = (rect.height * dpr) | 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScene(rect.width, rect.height);
    };

    const resizeHandler = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.fillStyle = BG_FILL;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(doResize, DEBOUNCE_MS);
    };

    const observer = new ResizeObserver(resizeHandler);
    observer.observe(canvas);
    doResize();

    const render = (now: number) => {
      if (!alive) return;
      const t = now * 0.001;
      const d = dataRef.current;
      const scrollY = window.scrollY;

      const currentViewW = canvas.width / dpr;
      const currentViewH = canvas.height / dpr;

      ctx.fillStyle = BG_FILL;
      ctx.fillRect(0, 0, currentViewW, currentViewH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";

      if (scrollY < d.transitionH && d.staticNebulaBuf) {
        ctx.save();
        ctx.translate(0, -scrollY);

        ctx.drawImage(d.staticNebulaBuf, 0, 0, d.width, d.transitionH);

        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < d.clouds.length; i++) {
          const cl = d.clouds[i];
          const drift = Math.sin(t * cl.driftSpeed + cl.phase);
          const absDrift = drift < 0 ? -drift : drift;
          const driftAlpha = cl.alpha * 0.08 * absDrift;
          if (driftAlpha < 0.005) continue;

          const scx = cl.cx + drift * cl.driftX * d.width;
          const scy = cl.cy + drift * cl.driftY * d.transitionH;
          const srx = cl.rx;
          const sry = cl.ry;
          const maxR = srx > sry ? srx : sry;
          if (maxR < 1) continue;

          const grad = ctx.createRadialGradient(
            scx | 0,
            scy | 0,
            0,
            scx | 0,
            scy | 0,
            maxR | 0
          );
          grad.addColorStop(
            0,
            `${cl.driftGradStopBase}${driftAlpha.toFixed(3)})`
          );
          grad.addColorStop(1, cl.driftGradStopEdge);

          ctx.save();
          ctx.translate(scx | 0, scy | 0);
          ctx.scale(1, sry / Math.max(srx, 1));
          ctx.translate(-(scx | 0), -(scy | 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(scx | 0, scy | 0, maxR | 0, 0, TWO_PI);
          ctx.fill();
          ctx.restore();
        }

        if (d.maskBuf) {
          ctx.globalCompositeOperation = "source-over";
          ctx.drawImage(d.maskBuf, 0, 0, d.width, d.transitionH);
        }

        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";

      const starParallax = scrollY * 0.5;
      const starWrapArea = d.height * 3;

      for (let i = 0; i < d.stars.length; i++) {
        const star = d.stars[i];
        const alpha =
          star.opacity * (0.5 + 0.5 * Math.sin(t * star.speed + star.phase));
        if (alpha < CULL_THRESHOLD) continue;

        let sy = (star.y - starParallax) % starWrapArea;
        if (sy < 0) sy += starWrapArea;

        if (sy > currentViewH + 50) continue;

        const sx = star.x | 0;
        const isy = sy | 0;

        ctx.fillStyle = star.color;

        if (star.hasHalo) {
          ctx.globalAlpha = alpha * 0.12;
          ctx.beginPath();
          ctx.arc(sx, isy, star.haloRadius, 0, TWO_PI);
          ctx.fill();
        }

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, isy, star.radius, 0, TWO_PI);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [buildScene]);

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none pointer-events-none"
      style={{ backgroundColor: BG_FILL }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
