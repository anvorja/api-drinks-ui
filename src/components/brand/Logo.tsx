import { cn } from "cn"

import { radarPolygon } from "@/lib/radar"

/** A signature DNA shape: the same nine axes the app measures. */
const MARK_DNA = [90, 55, 30, 75, 100, 45, 35, 80, 50]

/** The mark: a cocktail glass whose liquid is a flavor radar. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-9", className)}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="logo-liquid" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--brand-coral)" />
          <stop offset="1" stopColor="var(--brand-amber)" />
        </linearGradient>
      </defs>
      <circle cx="38.5" cy="7.5" r="3.5" fill="var(--brand-amber)" />
      <path
        d="M5 9h38L24 29.5Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <polygon
        points={radarPolygon(MARK_DNA, 8.5, 0)}
        transform="translate(24 16.5)"
        fill="url(#logo-liquid)"
        stroke="var(--brand-amber)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M24 29.5V41M16 42h16"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-heading text-lg leading-none font-bold tracking-tight">
        <span className="inline-block -skew-x-6 text-highlight">Crazy</span>{" "}
        Drinks
      </span>
    </span>
  )
}
