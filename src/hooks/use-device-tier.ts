"use client";

import { useState, useEffect } from "react";

export type DeviceTier = "high" | "low" | "fallback";

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("fallback");

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");

      if (!gl) {
        return;
      }

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        setTier("low");
        return;
      }

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl
          .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          .toLowerCase();
        const isIntegratedGPU =
          renderer.includes("intel") ||
          renderer.includes("hd graphics") ||
          renderer.includes("uhd") ||
          renderer.includes("mali");

        if (isIntegratedGPU) {
          setTier("low");
          return;
        }
      }

      setTier("high");
    } catch {
      setTier("fallback");
    }
  }, []);

  return tier;
}
