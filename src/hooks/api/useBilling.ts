import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"

export const billingKeys = {
  plans: () => ["billing", "plans"] as const,
  subscription: () => ["billing", "subscription"] as const,
  payments: () => ["billing", "payments"] as const,
}

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: ({ signal }) => call(api.GET("/v1/plans", { signal })),
    staleTime: 30 * 60_000,
  })
}

export function useMySubscription() {
  const { user } = useAuth()
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: ({ signal }) => call(api.GET("/v1/me/subscription", { signal })),
    enabled: user !== null,
  })
}

export function usePayments() {
  return useQuery({
    queryKey: billingKeys.payments(),
    queryFn: ({ signal }) => call(api.GET("/v1/me/payments", { signal })),
  })
}

/** Creates a Wompi Web Checkout and sends the browser there. */
export function useCheckout() {
  return useMutation({
    mutationFn: (planId: string) =>
      call(api.POST("/v1/me/subscription/checkout", { body: { planId } })),
    onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
  })
}

/** Settles a payment when coming back from Wompi. Idempotent: safe to call again. */
export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (transactionId: string) =>
      call(api.POST("/v1/me/payments/verify", { body: { transactionId } })),
    onSuccess: (payment) => {
      if (payment.status !== "pending") {
        void queryClient.invalidateQueries({ queryKey: ["billing"] })
      }
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => call(api.POST("/v1/me/subscription/cancel")),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() }),
  })
}
