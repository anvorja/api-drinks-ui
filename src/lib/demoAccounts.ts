/**
 * Demo accounts seeded by the API (migration 0013, synthetic data). Only shown when
 * VITE_DEMO_ACCOUNTS=true. See the API README, "Cuentas demo".
 */
export const DEMO_PASSWORD = "ApiDrinks2026"

export const DEMO_ACCOUNTS = [
  {
    email: "premium@api-drinks.local",
    who: "Laura · Premium",
    shows: "ADN, swipe, Cocktle y tarjeta compartible",
    emoji: "🧬",
  },
  {
    email: "bar@api-drinks.local",
    who: "Carlos · Dueño de bar",
    shows: "Carta inteligente de La Barra Demo",
    emoji: "🍸",
  },
  {
    email: "basico@api-drinks.local",
    who: "Mateo · Básico",
    shows: "Pagar el plan Pro con Wompi (sandbox)",
    emoji: "💳",
  },
  {
    email: "menor@api-drinks.local",
    who: "Valentina · Menor de edad",
    shows: "Solo bebidas sin alcohol y Cocktle zero",
    emoji: "🧃",
  },
  {
    email: "admin.demo@api-drinks.local",
    who: "Admin",
    shows: "Todo el catálogo",
    emoji: "🛠️",
  },
] as const
