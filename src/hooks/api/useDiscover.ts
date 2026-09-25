import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"
import type { Reaction } from "./types"
import { favoriteKeys } from "./useFavorites"
import { tasteKeys } from "./useTaste"

export const discoverKeys = {
  deck: () => ["discover", "deck"] as const,
  stats: () => ["discover", "stats"] as const,
}

export function useDiscoverDeck() {
  return useQuery({
    queryKey: discoverKeys.deck(),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/discover/deck", {
          params: { query: { count: 12 } },
          signal,
        })
      ),
    staleTime: Infinity,
  })
}

export function useDiscoverStats() {
  return useQuery({
    queryKey: discoverKeys.stats(),
    queryFn: ({ signal }) => call(api.GET("/v1/discover/stats", { signal })),
  })
}

const invalidateTaste = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: tasteKeys.all }),
    queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
    queryClient.invalidateQueries({ queryKey: discoverKeys.stats() }),
  ])

/** Like, dislike or superlike. The result carries the taste after the swipe, to show it live. */
export function useReact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      drinkId,
      reaction,
    }: {
      drinkId: string
      reaction: Reaction
    }) =>
      call(
        api.PUT("/v1/discover/{drinkId}", {
          params: { path: { drinkId } },
          body: { reaction },
        })
      ),
    onSuccess: () => invalidateTaste(queryClient),
  })
}

export function useUndoReaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (drinkId: string) =>
      call(
        api.DELETE("/v1/discover/{drinkId}", { params: { path: { drinkId } } })
      ),
    onSuccess: () => invalidateTaste(queryClient),
  })
}
