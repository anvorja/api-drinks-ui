import type { DrinkFilters } from "@/hooks/api/useDrinks"

const BOOLEAN = new Set(["true", "false"])

/** Filters live in the URL, so a filtered view can be shared or bookmarked. */
export function filtersFromParams(params: URLSearchParams): DrinkFilters {
  const pick = (key: string) => params.get(key)?.trim() || undefined
  const flag = (key: string) => {
    const value = params.get(key)
    return value && BOOLEAN.has(value) ? (value as "true" | "false") : undefined
  }
  const ingredients = (params.get("ingredients") ?? "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean)

  return {
    q: pick("q"),
    category: pick("category"),
    glass: pick("glass"),
    alcoholic: flag("alcoholic"),
    iba: flag("iba"),
    ingredients: ingredients.length ? ingredients : undefined,
  }
}

export function paramsFromFilters(filters: DrinkFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","))
    } else if (value) {
      params.set(key, value)
    }
  }
  return params
}

/** How many filters (not the text search) are on, for the "Filtros (n)" badge. */
export const activeFilterCount = (filters: DrinkFilters) =>
  [filters.category, filters.glass, filters.alcoholic, filters.iba].filter(
    Boolean
  ).length + (filters.ingredients?.length ?? 0)
