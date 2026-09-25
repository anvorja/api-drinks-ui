import { cn } from "cn"
import { motion } from "motion/react"
import { useId, useState } from "react"

import {
  FLAVOR_EMOJI,
  FLAVOR_LABEL,
  FLAVORS,
  rankFlavors,
  type Flavor,
  type FlavorProfile,
} from "@/lib/flavors"
import { radarPoint, radarPolygon } from "@/lib/radar"

type Series = {
  profile: FlavorProfile
  label: string
  /** "primary" is coral/amber (you); "secondary" is a lighter outline (someone else). */
  tone?: "primary" | "secondary"
}

type DnaRadarProps = {
  series: Series[]
  /** Axes to highlight (the dominant ones). */
  dominant?: readonly Flavor[]
  size?: number
  showLabels?: boolean
  className?: string
}

const RINGS = [25, 50, 75, 100]

/** The nine-axis flavor radar, drawn in SVG like the shareable card. */
export function DnaRadar({
  series,
  dominant = [],
  size = 320,
  showLabels = true,
  className,
}: DnaRadarProps) {
  const id = useId()
  const [focus, setFocus] = useState<Flavor | null>(null)
  const padding = showLabels ? 56 : 8
  const center = size / 2
  const radius = center - padding
  const main = series[0]

  const summary = main
    ? `${main.label}: ${rankFlavors(main.profile)
        .slice(0, 3)
        .map((f) => `${FLAVOR_LABEL[f]} ${main.profile[f] ?? 0}`)
        .join(", ")}`
    : ""

  return (
    <figure className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={summary}
      >
        <defs>
          <radialGradient id={`${id}-fill`} cx="50%" cy="50%" r="60%">
            <stop
              offset="0"
              stopColor="var(--brand-amber)"
              stopOpacity="0.85"
            />
            <stop
              offset="1"
              stopColor="var(--brand-coral)"
              stopOpacity="0.55"
            />
          </radialGradient>
        </defs>

        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={radarPolygon(
              FLAVORS.map(() => ring),
              radius,
              center
            )}
            className="fill-none stroke-foreground/10"
            strokeDasharray={ring === 100 ? undefined : "3 4"}
          />
        ))}
        {FLAVORS.map((flavor, i) => {
          const end = radarPoint(i, FLAVORS.length, 100, radius, center)
          return (
            <line
              key={flavor}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              className={cn(
                "stroke-foreground/10",
                focus === flavor && "stroke-amber"
              )}
            />
          )
        })}

        {series.map((s, index) => {
          const values = FLAVORS.map((f) => s.profile[f] ?? 0)
          const secondary = s.tone === "secondary"
          return (
            <motion.g
              key={s.label}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 16,
                delay: index * 0.15,
              }}
              style={{
                originX: "50%",
                originY: "50%",
                transformBox: "view-box",
              }}
            >
              <polygon
                points={radarPolygon(values, radius, center)}
                fill={secondary ? "var(--foreground)" : `url(#${id}-fill)`}
                fillOpacity={secondary ? 0.08 : 1}
                stroke={secondary ? "var(--foreground)" : "var(--brand-amber)"}
                strokeOpacity={secondary ? 0.6 : 1}
                strokeWidth={2}
                strokeDasharray={secondary ? "6 4" : undefined}
                strokeLinejoin="round"
              />
              {!secondary &&
                values.map((value, i) => {
                  const p = radarPoint(i, FLAVORS.length, value, radius, center)
                  return (
                    <circle
                      key={FLAVORS[i]}
                      cx={p.x}
                      cy={p.y}
                      r={focus === FLAVORS[i] ? 5 : 3}
                      className="fill-amber transition-all"
                    />
                  )
                })}
            </motion.g>
          )
        })}

        {showLabels &&
          FLAVORS.map((flavor, i) => {
            const p = radarPoint(i, FLAVORS.length, 100, radius + 26, center)
            const isDominant = dominant.includes(flavor)
            return (
              <g
                key={flavor}
                tabIndex={0}
                role="button"
                aria-label={`${FLAVOR_LABEL[flavor]}: ${main?.profile[flavor] ?? 0} de 100`}
                onMouseEnter={() => setFocus(flavor)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(flavor)}
                onBlur={() => setFocus(null)}
                className="cursor-default outline-none"
              >
                <text
                  x={p.x}
                  y={p.y - 6}
                  textAnchor="middle"
                  className="text-[15px]"
                >
                  {FLAVOR_EMOJI[flavor]}
                </text>
                <text
                  x={p.x}
                  y={p.y + 11}
                  textAnchor="middle"
                  className={cn(
                    "font-heading text-[11px] font-semibold",
                    isDominant ? "fill-highlight" : "fill-muted-foreground",
                    focus === flavor && "fill-foreground"
                  )}
                >
                  {focus === flavor
                    ? `${main?.profile[flavor] ?? 0}`
                    : FLAVOR_LABEL[flavor]}
                </text>
              </g>
            )
          })}
      </svg>
      {series.length > 1 && (
        <figcaption className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  s.tone === "secondary"
                    ? "border border-dashed border-foreground/70"
                    : "bg-gradient-to-br from-coral to-amber"
                )}
              />
              {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}
