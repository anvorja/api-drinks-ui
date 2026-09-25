import { describe, expect, it } from "vitest"

import {
  canManageVenues,
  nextStepAfterUpgrade,
  planPerks,
  usablePerkGroups,
} from "../entitlements"

const pro = {
  id: "pro",
  name: "Pro",
  monthlyPrice: 89000,
  currency: "COP",
  limits: {
    venues: 3,
    inventoryItems: 300,
    menuPricing: true,
    apiKeys: 3,
    apiDailyRequests: 10000,
  },
}

describe("canManageVenues", () => {
  it("is for bar owners and admins only", () => {
    expect(canManageVenues("venue_owner")).toBe(true)
    expect(canManageVenues("admin")).toBe(true)
    expect(canManageVenues("user")).toBe(false)
    expect(canManageVenues("premium")).toBe(false)
    expect(canManageVenues(undefined)).toBe(false)
  })
})

describe("planPerks", () => {
  it("groups the limits by who uses them", () => {
    const [bar, api] = planPerks(pro)
    expect(bar?.perks).toEqual([
      "3 bares",
      "300 ítems de inventario",
      "Carta con costo, precio sugerido y margen",
    ])
    expect(api?.perks).toEqual(["3 llaves de API", "10.000 peticiones al día"])
  })

  it("speaks of unlimited limits", () => {
    const [bar] = planPerks({
      ...pro,
      limits: { ...pro.limits, venues: null, inventoryItems: null },
    })
    expect(bar?.perks.slice(0, 2)).toEqual([
      "bares ilimitados",
      "Inventario ilimitado",
    ])
  })
})

describe("usablePerkGroups", () => {
  it("gives personal accounts the API perks only", () => {
    expect([...usablePerkGroups("user")]).toEqual(["api"])
    expect([...usablePerkGroups("venue_owner")]).toEqual(["bar", "api"])
  })
})

describe("nextStepAfterUpgrade", () => {
  it("sends each account to what the plan unlocks for it", () => {
    expect(nextStepAfterUpgrade("venue_owner").to).toBe("/mi-bar")
    expect(nextStepAfterUpgrade("user").to).toBe("/cuenta#api")
  })
})
