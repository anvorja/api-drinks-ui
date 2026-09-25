import { Navigate, Outlet, useLocation } from "react-router"

import { useAuth } from "@/hooks/useAuth"

/** Route guard: anonymous visitors go to sign in and come back afterwards. */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/entrar?next=${next}`} replace />
  }
  return <Outlet />
}
