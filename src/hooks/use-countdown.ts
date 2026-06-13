"use client";

import { useState, useEffect } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function parseEventDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function useCountdown(target: string | Date | null): CountdownParts | null {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (!target) {
      setParts(null);
      return;
    }
    const time = new Date(target).getTime();
    if (Number.isNaN(time)) {
      setParts(null);
      return;
    }

    const tick = () => {
      const diff = time - Date.now();
      if (diff <= 0) {
        setParts({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setParts({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        minutes: Math.floor(diff / 60000) % 60,
        seconds: Math.floor(diff / 1000) % 60,
        isPast: false,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}
