import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"

export type DrinkFilters = {
  q?: string
  category?: string
  glass?: string
  alcoholic?: "true" | "false"
  iba?: "true" | "false"
  /** Ingredient names; the drink must have all of them. */
  ingredients?: string[]
}

const PAGE_SIZE = 24

export const drinkKeys = {
  all: ["drinks"] as const,
  list: (filters: DrinkFilters) => ["drinks", "list", filters] as const,
  facets: () => ["drinks", "facets"] as const,
  suggest: (q: string) => ["drinks", "suggest", q] as const,
  detail: (id: string) => ["drinks", "detail", id] as const,
  dna: (id: string) => ["drinks", "dna", id] as const,
  twins: (id: string) => ["drinks", "twins", id] as const,
  ofTheDay: () => ["drinks", "of-the-day"] as const,
}

/** Catalog with filters and cursor pagination, for infinite scroll. */
export function useDrinkSearch(filters: DrinkFilters) {
  return useInfiniteQuery({
    queryKey: drinkKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      call(
        api.GET("/v1/drinks", {
          params: {
            query: {
              ...filters,
              ingredients: filters.ingredients?.join(",") || undefined,
              limit: PAGE_SIZE,
              cursor: pageParam,
            },
          },
          signal,
        })
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  })
}

export function useDrinkFacets() {
  return useQuery({
    queryKey: drinkKeys.facets(),
    queryFn: ({ signal }) => call(api.GET("/v1/drinks/facets", { signal })),
    staleTime: 10 * 60_000,
  })
}

/** Typo-tolerant autocomplete. Pass the debounced text. */
export function useDrinkSuggestions(q: string, limit = 8) {
  const text = q.trim()
  return useQuery({
    queryKey: drinkKeys.suggest(text),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/drinks/suggest", {
          params: { query: { q: text, limit } },
          signal,
        })
      ),
    enabled: text.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useDrink(id: string) {
  return useQuery({
    queryKey: drinkKeys.detail(id),
    queryFn: ({ signal }) =>
      call(api.GET("/v1/drinks/{id}", { params: { path: { id } }, signal })),
  })
}

export function useDrinkDna(id: string, enabled = true) {
  return useQuery({
    queryKey: drinkKeys.dna(id),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/drinks/{id}/dna", { params: { path: { id } }, signal })
      ),
    enabled,
  })
}

export function useDrinkTwins(id: string, enabled = true) {
  return useQuery({
    queryKey: drinkKeys.twins(id),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/drinks/{id}/twins", {
          params: { path: { id }, query: { limit: 6 } },
          signal,
        })
      ),
    enabled,
  })
}

export function useDrinkOfTheDay() {
  return useQuery({
    queryKey: drinkKeys.ofTheDay(),
    queryFn: ({ signal }) => call(api.GET("/v1/drinks/of-the-day", { signal })),
    staleTime: 30 * 60_000,
  })
}
