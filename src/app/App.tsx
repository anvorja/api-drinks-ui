import { RouterProvider } from "react-router"

import { Splash } from "@/components/common/Splash"
import { useAuth } from "@/hooks/useAuth"
import { router } from "./router"

export function App() {
  const { status } = useAuth()
  // Screens wait for the session: they would otherwise load once as anonymous and again as the user.
  if (status === "loading") return <Splash />
  return <RouterProvider router={router} />
}
