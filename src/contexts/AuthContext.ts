import { createContext } from "react"

import type { components } from "@/lib/api/schema"
import type { User } from "@/lib/auth/session"

export type RegisterInput = components["schemas"]["RegisterRequest"]

/**
 * Contract of the session: what AuthProvider offers and useAuth() exposes.
 * `loading` only lasts while the app tries to recover the session from the refresh cookie.
 */
export type AuthContextValue = {
  status: "loading" | "authenticated" | "anonymous"
  user: User | null
  isAdult: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  /** Re-reads the user (after a plan change, for example). */
  reloadUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
