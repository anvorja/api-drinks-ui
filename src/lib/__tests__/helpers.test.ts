import { describe, expect, it } from "vitest"

import { FLAVORS, rankFlavors } from "../flavors"
import { formatMoney } from "../format"
import { safeNext } from "../redirect"
import { slugFromInput } from "../taste"

describe("safeNext", () => {
  it("keeps paths inside the app", () => {
    expect(safeNext("/mi-adn?x=1")).toBe("/mi-adn?x=1")
  })

  it("rejects other sites (open redirect)", () => {
    expect(safeNext("https://evil.test")).toBe("/")
    expect(safeNext("//evil.test")).toBe("/")
    expect(safeNext(null, "/descubrir")).toBe("/descubrir")
  })
})

describe("slugFromInput", () => {
  it("accepts app links, API links and bare slugs", () => {
    expect(slugFromInput("http://lvh.me:5173/adn/laura-demo-adn")).toBe(
      "laura-demo-adn"
    )
    expect(
      slugFromInput("https://api.test/v1/taste/q3Z8vK1mXw2a/card.png")
    ).toBe("q3Z8vK1mXw2a")
    expect(slugFromInput("  laura-demo-adn ")).toBe("laura-demo-adn")
  })

  it("rejects anything else", () => {
    expect(slugFromInput("hola mundo")).toBeNull()
    expect(slugFromInput("")).toBeNull()
  })
})

describe("rankFlavors", () => {
  it("sorts strongest first, missing keys as 0", () => {
    const ranked = rankFlavors({ sour: 100, sweet: 40 })
    expect(ranked.slice(0, 2)).toEqual(["sour", "sweet"])
    expect(ranked).toHaveLength(FLAVORS.length)
  })
})

describe("formatMoney", () => {
  it("formats COP without decimals", () => {
    expect(formatMoney(89000).replace(/\s/g, " ")).toBe("$ 89.000")
  })
})
