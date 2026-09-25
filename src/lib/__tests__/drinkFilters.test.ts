import { describe, expect, it } from "vitest"

import {
  activeFilterCount,
  filtersFromParams,
  paramsFromFilters,
} from "../drinkFilters"

describe("drink filters in the URL", () => {
  it("reads every filter", () => {
    const params = new URLSearchParams(
      "q=mojito&category=Cocktail&alcoholic=false&iba=true&ingredients=ron, limón,"
    )
    expect(filtersFromParams(params)).toEqual({
      q: "mojito",
      category: "Cocktail",
      glass: undefined,
      alcoholic: "false",
      iba: "true",
      ingredients: ["ron", "limón"],
    })
  })

  it("ignores invalid booleans and empty values", () => {
    const filters = filtersFromParams(
      new URLSearchParams("alcoholic=maybe&q=  ")
    )
    expect(filters.alcoholic).toBeUndefined()
    expect(filters.q).toBeUndefined()
    expect(filters.ingredients).toBeUndefined()
  })

  it("round-trips", () => {
    const filters = { glass: "Highball glass", ingredients: ["Gin", "Tonic"] }
    expect(filtersFromParams(paramsFromFilters(filters))).toMatchObject(filters)
    expect(
      paramsFromFilters({ q: undefined, ingredients: [] }).toString()
    ).toBe("")
  })

  it("counts active filters, not the text search", () => {
    expect(
      activeFilterCount({ q: "x", category: "Shot", ingredients: ["a", "b"] })
    ).toBe(3)
  })
})
