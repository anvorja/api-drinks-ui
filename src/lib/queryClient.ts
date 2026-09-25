import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/errors"

/** Client errors (4xx) will not fix themselves by retrying; 429 waits for Retry-After instead. */
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return error.code === "RATE_LIMITED" && failureCount < 1
  }
  return failureCount < 2
}

function retryDelay(attempt: number, error: unknown) {
  if (error instanceof ApiError && error.retryAfter) {
    return error.retryAfter * 1000
  }
  return Math.min(1000 * 2 ** attempt, 8000)
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  })
}
