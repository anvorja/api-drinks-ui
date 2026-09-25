import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"
import type { components } from "@/lib/api/schema"

export const venueKeys = {
  mine: () => ["venues", "mine"] as const,
  detail: (id: string) => ["venues", id] as const,
  inventory: (id: string) => ["venues", id, "inventory"] as const,
  menu: (id: string, maxMissing: number) =>
    ["venues", id, "menu", maxMissing] as const,
}

export function useMyVenues() {
  return useQuery({
    queryKey: venueKeys.mine(),
    queryFn: ({ signal }) => call(api.GET("/v1/venues/mine", { signal })),
  })
}

export function useVenueMenu(id: string, maxMissing = 1) {
  return useQuery({
    queryKey: venueKeys.menu(id, maxMissing),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/venues/{id}/menu", {
          params: { path: { id }, query: { maxMissing } },
          signal,
        })
      ),
  })
}

export function useVenueInventory(id: string) {
  return useQuery({
    queryKey: venueKeys.inventory(id),
    queryFn: ({ signal }) =>
      call(
        api.GET("/v1/venues/{id}/inventory", {
          params: { path: { id } },
          signal,
        })
      ),
  })
}

type InventoryInput = components["schemas"]["InventoryItemInput"]

export function useReplaceInventory(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: InventoryInput[]) =>
      call(
        api.PUT("/v1/venues/{id}/inventory", {
          params: { path: { id } },
          body: { items },
        })
      ),
    onSuccess: (inventory) => {
      queryClient.setQueryData(venueKeys.inventory(id), inventory)
      void queryClient.invalidateQueries({ queryKey: ["venues", id, "menu"] })
    },
  })
}

type CreateVenue = components["schemas"]["CreateVenueRequest"]

export function useCreateVenue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateVenue) => call(api.POST("/v1/venues", { body })),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: venueKeys.mine() }),
  })
}
