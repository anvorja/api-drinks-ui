import { beforeEach, describe, expect, it, vi } from "vitest"

const post = vi.fn()
vi.mock("@/lib/api/http", () => ({
  rawApi: { POST: (...args: unknown[]) => post(...args) },
}))

const { refreshSession, sessionStore, mayHaveSession } =
  await import("../auth/session")

const user = {
  id: "5eed0000-0000-4000-8000-000000000002",
  email: "premium@api-drinks.local",
  name: "Laura",
  role: "premium" as const,
  birthDate: "1995-07-21",
  adult: true,
  createdAt: "2026-09-25T12:00:00Z",
}
const session = {
  tokenType: "Bearer" as const,
  accessToken: "jwt",
  expiresIn: 900,
  refreshToken: null,
  refreshTokenIn: "cookie" as const,
  user,
}

beforeEach(() => {
  post.mockReset()
  sessionStore.clear()
})

describe("refreshSession", () => {
  it("shares one request between concurrent callers (the token rotates)", async () => {
    post.mockResolvedValue({
      data: session,
      response: new Response(null, { status: 200 }),
    })
    const results = await Promise.all([
      refreshSession(),
      refreshSession(),
      refreshSession(),
    ])
    expect(results).toEqual([true, true, true])
    expect(post).toHaveBeenCalledTimes(1)
    expect(sessionStore.user()?.email).toBe(user.email)
    expect(sessionStore.freshAccessToken()).toBe("jwt")
    expect(mayHaveSession()).toBe(true)
  })

  it("clears the session when the cookie is no longer valid", async () => {
    sessionStore.start(session)
    post.mockResolvedValue({
      error: { code: "INVALID_REFRESH_TOKEN", message: "x" },
      response: new Response(null, { status: 401 }),
    })
    await expect(refreshSession()).resolves.toBe(false)
    expect(sessionStore.user()).toBeNull()
    expect(mayHaveSession()).toBe(false)
  })

  it("rejects on network failure without dropping the session", async () => {
    sessionStore.start(session)
    post.mockRejectedValue(new TypeError("Failed to fetch"))
    await expect(refreshSession()).rejects.toThrow("Failed to fetch")
    expect(sessionStore.user()).not.toBeNull()
  })
})

describe("sessionStore", () => {
  it("treats a token about to expire as stale", () => {
    sessionStore.start({ ...session, expiresIn: 10 })
    expect(sessionStore.freshAccessToken()).toBeNull()
    expect(sessionStore.accessToken()).toBe("jwt")
  })
})
