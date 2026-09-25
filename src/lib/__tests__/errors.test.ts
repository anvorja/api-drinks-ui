import { describe, expect, it } from "vitest"

import { ApiError, call, errorMessage, isApiError, unwrap } from "../api/errors"

const response = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers })

describe("unwrap", () => {
  it("returns data on success", () => {
    expect(unwrap({ data: { ok: 1 }, response: response(200) })).toEqual({
      ok: 1,
    })
  })

  it("throws an ApiError with the code, request id and Retry-After", () => {
    try {
      unwrap({
        error: { code: "RATE_LIMITED", message: "slow down", requestId: "r-1" },
        response: response(429, { "Retry-After": "7" }),
      })
      expect.unreachable()
    } catch (error) {
      expect(isApiError(error, "RATE_LIMITED")).toBe(true)
      const e = error as ApiError
      expect(e.status).toBe(429)
      expect(e.retryAfter).toBe(7)
      expect(e.requestId).toBe("r-1")
      expect(errorMessage(e)).toBe("Vas muy rápido. Intenta de nuevo en 7 s.")
    }
  })
})

describe("call", () => {
  it("turns a network failure into NETWORK_ERROR", async () => {
    await expect(
      call(Promise.reject(new TypeError("Failed to fetch")))
    ).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    })
  })
})

describe("errorMessage", () => {
  it("speaks Spanish by code and never leaks the English hint", () => {
    const error = new ApiError({
      status: 403,
      code: "AGE_RESTRICTED",
      message: "adults only",
    })
    expect(errorMessage(error)).toBe(
      "Este contenido es solo para mayores de 18 años."
    )
    expect(errorMessage(new Error("boom"))).toBe(
      "Algo salió mal. Intenta de nuevo."
    )
  })
})
