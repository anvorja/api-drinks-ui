import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"

export const apiKeyKeys = { all: ["api-keys"] as const }

/** Keys and today's quota (shared by all the keys of the account). */
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: ({ signal }) => call(api.GET("/v1/me/api-keys", { signal })),
  })
}

/** The response carries the secret: it is shown once and never stored in the cache. */
export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      call(api.POST("/v1/me/api-keys", { body: { name } })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all }),
  })
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      call(api.DELETE("/v1/me/api-keys/{id}", { params: { path: { id } } })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all }),
  })
}
