import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

const load = async (apiUrl: string) => {
  vi.stubEnv("VITE_API_URL", apiUrl)
  return import("@/config/env")
}

describe("config", () => {
  it("drops the trailing slash of an absolute API URL", async () => {
    const { config, apiAsset } = await load("https://api.example.test/")
    expect(config.apiUrl).toBe("https://api.example.test")
    expect(apiAsset("/v1/taste/x/card.png")).toBe(
      "https://api.example.test/v1/taste/x/card.png"
    )
  })

  it("treats / as the same origin (Netlify proxy)", async () => {
    const { config, apiAsset } = await load("/")
    expect(config.apiUrl).toBe("")
    expect(apiAsset("/v1/taste/x/card.png")).toBe("/v1/taste/x/card.png")
  })

  it("fails fast without an API URL", async () => {
    await expect(load("")).rejects.toThrow("Missing VITE_API_URL")
  })
})
