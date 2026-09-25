import { describe, expect, it } from "vitest"

import { radarPoint, radarPolygon } from "../radar"

describe("radarPoint", () => {
  it("points the first axis straight up", () => {
    expect(radarPoint(0, 4, 100, 10, 50)).toEqual({ x: 50, y: 40 })
  })

  it("goes clockwise", () => {
    expect(radarPoint(1, 4, 100, 10, 50)).toEqual({ x: 60, y: 50 })
  })

  it("clamps values to 0-100", () => {
    expect(radarPoint(0, 4, 250, 10, 50)).toEqual({ x: 50, y: 40 })
    expect(radarPoint(0, 4, -5, 10, 50)).toEqual({ x: 50, y: 50 })
  })
})

describe("radarPolygon", () => {
  it("joins one point per value", () => {
    expect(radarPolygon([100, 0, 100, 0], 10, 50)).toBe(
      "50,40 50,50 50,60 50,50"
    )
  })
})
