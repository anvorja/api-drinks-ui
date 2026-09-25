import { useQueryClient } from "@tanstack/react-query"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { AuthContext, type RegisterInput } from "@/contexts/AuthContext"
import { api } from "@/lib/api/client"
import { call } from "@/lib/api/errors"
import { rawApi } from "@/lib/api/http"
import {
  mayHaveSession,
  refreshSession,
  sessionStore,
  type User,
} from "@/lib/auth/session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(sessionStore.user)
  // Only boot through a refresh if this browser ever had a session.
  const [booting, setBooting] = useState(mayHaveSession)
  const previousUserId = useRef<string | null>(null)

  // Mirror the session store. When the person changes, cached data (filtered by age, plan…)
  // belongs to someone else: reset it, and the screens on view fetch it again.
  useEffect(
    () =>
      sessionStore.subscribe((next) => {
        setUser(next)
        const nextId = next?.id ?? null
        if (nextId !== previousUserId.current) {
          previousUserId.current = nextId
          void queryClient.resetQueries()
        }
      }),
    [queryClient]
  )

  // On load, recover the session from the httpOnly cookie (the access token lives in memory).
  // Screens wait for this, so nothing is fetched twice as anonymous and then as the user.
  useEffect(() => {
    if (!booting) return
    refreshSession()
      .catch(() => false)
      .finally(() => setBooting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on load
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await call(
      rawApi.POST("/v1/auth/login", { body: { email, password } })
    )
    sessionStore.start(session)
    return session.user
  }, [])

  const register = useCallback(
    async (input: RegisterInput) => {
      await call(rawApi.POST("/v1/auth/register", { body: input }))
      return login(input.email, input.password)
    },
    [login]
  )

  const logout = useCallback(async () => {
    try {
      await rawApi.POST("/v1/auth/logout", { body: {} })
    } finally {
      sessionStore.clear()
    }
  }, [])

  const reloadUser = useCallback(async () => {
    sessionStore.updateUser(await call(api.GET("/v1/auth/me")))
  }, [])

  const value = useMemo(
    () => ({
      status: booting
        ? ("loading" as const)
        : user
          ? ("authenticated" as const)
          : ("anonymous" as const),
      user,
      isAdult: user?.adult ?? false,
      login,
      register,
      logout,
      reloadUser,
    }),
    [booting, user, login, register, logout, reloadUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
