import type { CocktleGuess } from "@/hooks/api/types"

type Heat = CocktleGuess["heat"]

export const HEAT: Record<
  Heat,
  { label: string; emoji: string; className: string }
> = {
  correct: {
    label: "¡Es esa!",
    emoji: "🟩",
    className: "bg-heat-correct text-night",
  },
  hot: { label: "Caliente", emoji: "🟨", className: "bg-heat-hot text-night" },
  warm: { label: "Tibio", emoji: "🟧", className: "bg-heat-warm text-night" },
  cold: { label: "Frío", emoji: "🟥", className: "bg-heat-cold text-white" },
}
