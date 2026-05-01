"use client";

import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useDeviceTier, setFallbackMode } from "@/hooks/use-device-tier";
import UniverseWebGL from "./UniverseWebGL";
import UniverseFallback from "./UniverseFallback";

const SPACE_COLOR = "#05030d";

export interface UniverseProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  density?: number;
  frequency?: number;
  amplitude?: number;
  seed?: number;
  starSize?: number;
  revealDuration?: number;
}

export const Universe = forwardRef<HTMLDivElement, UniverseProps>(
  (
    {
      speed = 1.0,
      density = 1.0,
      frequency = 1.0,
      amplitude = 1.0,
      seed,
      starSize = 0.025,
      revealDuration = 3.0,
      style,
      ...props
    },
    ref
  ) => {
    const seedRef = useRef(seed ?? Math.random() * 1000);
    const [useFallback, setUseFallback] = useState(false);
    const [mounted, setMounted] = useState(false);
    const tier = useDeviceTier();

    useEffect(() => {
      setMounted(true);
    }, []);

    const handleWebGLError = useCallback(() => {
      setUseFallback(true);
      setFallbackMode(true);
    }, []);

    const actualSeed = seed ?? seedRef.current;
    const shouldUseFallback = useFallback || tier === "fallback";

    return (
      <div
        ref={ref}
        className="fixed top-0 left-0 w-full overflow-hidden pointer-events-none z-0"
        style={{ height: "100lvh", backgroundColor: SPACE_COLOR, ...style }}
        {...props}
      >
        <UniverseWebGL
          tier={tier}
          speed={speed}
          density={density}
          frequency={frequency}
          amplitude={amplitude}
          seed={actualSeed}
          starSize={starSize}
          revealDuration={revealDuration}
          onError={handleWebGLError}
        />
        {/*{!mounted ? (
          <div className="absolute inset-0" style={{ backgroundColor: SPACE_COLOR }} />
        ) : shouldUseFallback ? (
          <UniverseFallback
            seed={actualSeed}
            starSize={starSize * 2}
            density={density}
          />
        ) : (
          <UniverseWebGL
            tier={tier}
            speed={speed}
            density={density}
            frequency={frequency}
            amplitude={amplitude}
            seed={actualSeed}
            starSize={starSize}
            revealDuration={revealDuration}
            onError={handleWebGLError}
          />
        )}*/}
      </div>
    );
  }
);

Universe.displayName = "Universe";
export default Universe;