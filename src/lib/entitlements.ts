import type { components } from "@/lib/api/schema"
import type { User } from "@/lib/auth/session"

type Plan = components["schemas"]["Plan"]
type Role = User["role"]

/**
 * What each account can use, derived in one place. The API is the one that enforces it; the UI
 * only decides what to offer, so nobody sees buttons that lead to a "not allowed".
 */
export const canManageVenues = (role: Role | undefined) =>
  role === "venue_owner" || role === "admin"

export type PerkGroup = {
  id: "bar" | "api"
  title: string
  /** Who gets it; shown when the current account does not. */
  audience: string
  perks: string[]
}

const count = (n: number | null, one: string, other: string) =>
  n === null
    ? `${other} ilimitados`
    : `${n.toLocaleString("es-CO")} ${n === 1 ? one : other}`

/** A plan's limits as benefits, grouped by who uses them. */
export function planPerks(plan: Plan): PerkGroup[] {
  const { limits } = plan
  return [
    {
      id: "bar",
      title: "Para tu bar",
      audience: "Cuentas de bar",
      perks: [
        count(limits.venues, "bar", "bares"),
        limits.inventoryItems === null
          ? "Inventario ilimitado"
          : `${limits.inventoryItems.toLocaleString("es-CO")} ítems de inventario`,
        limits.menuPricing
          ? "Carta con costo, precio sugerido y margen"
          : "Carta sin costos ni márgenes",
      ],
    },
    {
      id: "api",
      title: "API para tus integraciones",
      audience: "Todas las cuentas",
      perks: [
        count(limits.apiKeys, "llave de API", "llaves de API"),
        `${limits.apiDailyRequests.toLocaleString("es-CO")} peticiones al día`,
      ],
    },
  ]
}

/** The groups this account can actually use. */
export const usablePerkGroups = (role: Role | undefined) =>
  new Set<PerkGroup["id"]>(canManageVenues(role) ? ["bar", "api"] : ["api"])

export type NextStep = { label: string; to: string; hint: string }

/** Where to go right after upgrading: to what the plan unlocks for this account. */
export function nextStepAfterUpgrade(role: Role | undefined): NextStep {
  if (canManageVenues(role)) {
    return {
      label: "Ver mi carta con márgenes",
      to: "/mi-bar",
      hint: "Tu carta ya muestra costo, precio sugerido y margen de cada coctel.",
    }
  }
  return {
    label: "Crear mi llave de API",
    to: "/cuenta#api",
    hint: "Tu plan ya incluye más llaves de API y peticiones para tus integraciones.",
  }
}
