import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"

export const tasteKeys = {
  all: ["taste"] as const,
  mine: () => ["taste", "mine"] as const,
  recommendations: () => ["taste", "recommendations"] as const,
  share: () => ["taste", "share"] as const,
  compatibility: (slug: string) => ["taste", "compatibility", slug] as const,
  public: (slug: string) => ["taste", "public", slug] as const,
}

export function useMyTaste() {
  const { user } = useAuth()
  return useQuery({
    queryKey: tasteKeys.mine(),
    queryFn: ({ signal }) => call(api.GET("/v1/me/taste", { signal })),
    enabled: user !== null,
  })
}

export function useTasteRecommendations(enabled = true) {
  return useQuery({
    queryKey: tasteKeys.recommendations(),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/me/taste/recommendations", {
          params: { query: { limit: 8 } },
          signal,
        })
      ),
    enabled,
  })
}

export function useTasteShare() {
  return useQuery({
    queryKey: tasteKeys.share(),
    queryFn: ({ signal }) => call(api.GET("/v1/me/taste/share", { signal })),
  })
}

export function useShareTaste() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (displayName: string) =>
      call(api.PUT("/v1/me/taste/share", { body: { displayName } })),
    onSuccess: (share) => queryClient.setQueryData(tasteKeys.share(), share),
  })
}

export function useStopSharingTaste() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => call(api.DELETE("/v1/me/taste/share")),
    onSuccess: () =>
      queryClient.setQueryData(tasteKeys.share(), { share: null }),
  })
}

export function useTasteCompatibility(slug: string | null) {
  return useQuery({
    queryKey: tasteKeys.compatibility(slug ?? ""),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/me/taste/compatibility/{slug}", {
          params: { path: { slug: slug ?? "" } },
          signal,
        })
      ),
    enabled: Boolean(slug),
  })
}

export function usePublicTaste(slug: string) {
  return useQuery({
    queryKey: tasteKeys.public(slug),
    queryFn: ({ signal }) =>
      call(api.GET("/v1/taste/{slug}", { params: { path: { slug } }, signal })),
  })
}
