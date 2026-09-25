import type { components } from "@/lib/api/schema"

export type Flavor = components["schemas"]["FlavorDna"]["dominant"][number]
/** 0-100 per flavor. The API types it as a string map, so missing keys read as 0. */
export type FlavorProfile = Readonly<Record<string, number>>
export type Strength = components["schemas"]["FlavorDna"]["strength"]

/** The nine axes of the flavor DNA, in the same order as the API's shareable card. */
export const FLAVORS: readonly Flavor[] = [
  "sweet",
  "sour",
  "bitter",
  "strong",
  "fruity",
  "herbal",
  "creamy",
  "fizzy",
  "spicy",
]

export const FLAVOR_LABEL: Record<Flavor, string> = {
  sweet: "Dulce",
  sour: "Ácido",
  bitter: "Amargo",
  strong: "Intenso",
  fruity: "Frutal",
  herbal: "Herbal",
  creamy: "Cremoso",
  fizzy: "Burbujeante",
  spicy: "Picante",
}

export const FLAVOR_EMOJI: Record<Flavor, string> = {
  sweet: "🍯",
  sour: "🍋",
  bitter: "🌿",
  strong: "🔥",
  fruity: "🍓",
  herbal: "🌱",
  creamy: "🥥",
  fizzy: "🫧",
  spicy: "🌶️",
}

export const STRENGTH_LABEL: Record<Strength, string> = {
  zero: "Sin alcohol",
  light: "Suave",
  medium: "Equilibrado",
  strong: "Fuerte",
}

export const CONFIDENCE_LABEL = {
  low: "Recién empezamos a conocerte",
  medium: "Ya te vamos conociendo",
  high: "Te conocemos muy bien",
} as const

/** Flavors sorted from strongest to weakest, for ranked lists. */
export const rankFlavors = (profile: FlavorProfile) =>
  [...FLAVORS].sort((a, b) => (profile[b] ?? 0) - (profile[a] ?? 0))
