import type { ComponentType } from "react"
import { createBrowserRouter } from "react-router"

import { RequireAuth } from "@/components/common/RequireAuth"
import { AppShell } from "@/components/layout/AppShell"
import { RouteError } from "@/pages/RouteError"

/** Each screen is its own chunk: the first load only brings what it shows. */
const page = (load: () => Promise<{ default: ComponentType }>) => () =>
  load().then((module) => ({ Component: module.default }))

export const router = createBrowserRouter([
  {
    Component: AppShell,
    ErrorBoundary: RouteError,
    children: [
      { index: true, lazy: page(() => import("@/pages/HomePage")) },
      { path: "explorar", lazy: page(() => import("@/pages/ExplorePage")) },
      { path: "bebida/:id", lazy: page(() => import("@/pages/DrinkPage")) },
      {
        path: "adn/:slug",
        lazy: page(() => import("@/pages/PublicTastePage")),
      },
      { path: "lab", lazy: page(() => import("@/pages/LabPage")) },
      { path: "planes", lazy: page(() => import("@/pages/PlansPage")) },
      { path: "entrar", lazy: page(() => import("@/pages/LoginPage")) },
      { path: "registro", lazy: page(() => import("@/pages/RegisterPage")) },
      {
        path: "recuperar-contrasena",
        lazy: page(() => import("@/pages/ForgotPasswordPage")),
      },
      {
        path: "restablecer-contrasena",
        lazy: page(() => import("@/pages/ResetPasswordPage")),
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: "descubrir",
            lazy: page(() => import("@/pages/DiscoverPage")),
          },
          { path: "mi-adn", lazy: page(() => import("@/pages/MyTastePage")) },
          { path: "cocktle", lazy: page(() => import("@/pages/CocktlePage")) },
          {
            path: "pago/resultado",
            lazy: page(() => import("@/pages/PaymentResultPage")),
          },
          { path: "mi-bar", lazy: page(() => import("@/pages/MyVenuesPage")) },
          { path: "mi-bar/:id", lazy: page(() => import("@/pages/VenuePage")) },
          { path: "cuenta", lazy: page(() => import("@/pages/AccountPage")) },
        ],
      },
      { path: "*", lazy: page(() => import("@/pages/NotFoundPage")) },
    ],
  },
])
