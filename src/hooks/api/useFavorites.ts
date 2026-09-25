import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"
import { tasteKeys } from "./useTaste"

export const favoriteKeys = { all: ["favorites"] as const }

export function useFavorites() {
  const { user } = useAuth()
  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: ({ signal }) => call(api.GET("/v1/me/favorites", { signal })),
    enabled: user !== null,
  })
}

/** Whether a drink is a favorite, and a toggle with an optimistic update. */
export function useFavoriteToggle(drinkId: string) {
  const queryClient = useQueryClient()
  const favorites = useFavorites()
  const isFavorite =
    favorites.data?.some((favorite) => favorite.drink.id === drinkId) ?? false

  const mutation = useMutation({
    mutationFn: async (add: boolean) => {
      const params = { params: { path: { drinkId } } }
      if (add) await call(api.PUT("/v1/me/favorites/{drinkId}", params))
      else await call(api.DELETE("/v1/me/favorites/{drinkId}", params))
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
        queryClient.invalidateQueries({ queryKey: tasteKeys.all }),
      ]),
  })

  const pending = mutation.isPending ? mutation.variables : undefined
  return {
    isFavorite: pending ?? isFavorite,
    toggle: () => mutation.mutateAsync(!(pending ?? isFavorite)),
    isPending: mutation.isPending,
  }
}
