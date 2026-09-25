import { cn } from "cn"

import { FLAVOR_EMOJI, FLAVOR_LABEL, type Flavor } from "@/lib/flavors"

export function FlavorChips({
  flavors,
  className,
}: {
  flavors: readonly Flavor[]
  className?: string
}) {
  if (flavors.length === 0) return null
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {flavors.map((flavor) => (
        <li
          key={flavor}
          className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-xs font-semibold text-highlight"
        >
          <span aria-hidden="true">{FLAVOR_EMOJI[flavor]}</span>
          {FLAVOR_LABEL[flavor]}
        </li>
      ))}
    </ul>
  )
}
