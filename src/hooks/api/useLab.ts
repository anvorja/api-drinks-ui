import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"

export const labKeys = {
  moods: () => ["lab", "moods"] as const,
  mood: (mood: string) => ["lab", "mood", mood] as const,
  pantry: (have: string[], alcoholic?: string) =>
    ["lab", "pantry", have, alcoholic] as const,
  myPantry: () => ["lab", "my-pantry"] as const,
}

export function useMoods() {
  return useQuery({
    queryKey: labKeys.moods(),
    queryFn: ({ signal }) => call(api.GET("/v1/lab/moods", { signal })),
    staleTime: Infinity,
  })
}

export function useMoodRecommendation(mood: string | null) {
  return useQuery({
    queryKey: labKeys.mood(mood ?? ""),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/lab/moods/{mood}", {
          params: { path: { mood: mood ?? "" } },
          signal,
        })
      ),
    enabled: Boolean(mood),
    // A new pick every time the person asks again.
    staleTime: 0,
  })
}

export function usePantrySuggestions(
  have: string[],
  alcoholic?: "true" | "false"
) {
  return useQuery({
    queryKey: labKeys.pantry(have, alcoholic),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/lab/pantry", {
          params: {
            query: {
              have: have.join(","),
              maxMissing: 1,
              limit: 12,
              alcoholic,
            },
          },
          signal,
        })
      ),
    enabled: have.length > 0,
    placeholderData: keepPreviousData,
  })
}

export function useMyPantry() {
  const { user } = useAuth()
  return useQuery({
    queryKey: labKeys.myPantry(),
    queryFn: ({ signal }) => call(api.GET("/v1/me/pantry", { signal })),
    enabled: user !== null,
  })
}

export function useSavePantry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ingredients: string[]) =>
      call(api.PUT("/v1/me/pantry", { body: { ingredients } })),
    onSuccess: (pantry) => queryClient.setQueryData(labKeys.myPantry(), pantry),
  })
}
