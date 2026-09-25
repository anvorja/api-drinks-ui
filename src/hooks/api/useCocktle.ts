import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"
import type { CocktleMode } from "./types"

export const cocktleKeys = {
  today: (mode: CocktleMode) => ["cocktle", "today", mode] as const,
  stats: (mode: CocktleMode) => ["cocktle", "stats", mode] as const,
}

export function useCocktleToday(mode: CocktleMode) {
  return useQuery({
    queryKey: cocktleKeys.today(mode),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/cocktle/today", { params: { query: { mode } }, signal })
      ),
  })
}

export function useCocktleStats(mode: CocktleMode) {
  return useQuery({
    queryKey: cocktleKeys.stats(mode),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/cocktle/stats", { params: { query: { mode } }, signal })
      ),
  })
}

export function useCocktleGuess(mode: CocktleMode) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (drinkId: string) =>
      call(api.POST("/v1/cocktle/today/guesses", { body: { drinkId, mode } })),
    onSuccess: (game) => {
      queryClient.setQueryData(cocktleKeys.today(mode), game)
      if (game.finished) {
        void queryClient.invalidateQueries({
          queryKey: cocktleKeys.stats(mode),
        })
      }
    },
  })
}
