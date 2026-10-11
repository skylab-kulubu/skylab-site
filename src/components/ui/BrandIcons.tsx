import React from "react";
import type { LucideIcon } from "lucide-react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
}

const createBrandIcon = (
  displayName: string,
  paths: React.ReactNode,
  fill = "none",
  stroke = "currentColor",
): LucideIcon => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className = "", ...props }, ref) => {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={fill}
          stroke={stroke}
          strokeWidth={stroke === "none" ? undefined : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-${displayName.toLowerCase()} ${className}`}
          {...props}
        >
          {paths}
        </svg>
      );
    },
  );
  Component.displayName = displayName;
  return Component as unknown as LucideIcon;
};

export const Github = createBrandIcon(
  "Github",
  <>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </>,
);

export const Twitter = createBrandIcon(
  "X",
  <path
    transform="translate(2.4 2.4) scale(0.8)"
    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  />,
  "currentColor",
  "none",
);

export const Instagram = createBrandIcon(
  "Instagram",
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>,
);

export const Linkedin = createBrandIcon(
  "Linkedin",
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </>,
);

export const Youtube = createBrandIcon(
  "Youtube",
  <>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </>,
);

export const Twitch = createBrandIcon(
  "Twitch",
  <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9H9V6h2v5zm4 0h-2V6h2v5z" />,
);

export const Figma = createBrandIcon(
  "Figma",
  <>
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 0 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 0 1-7 0z" />
  </>,
);
