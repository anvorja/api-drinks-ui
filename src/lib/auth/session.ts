import { ApiError, unwrap } from "@/lib/api/errors"
import { rawApi } from "@/lib/api/http"
import type { components } from "@/lib/api/schema"

export type User = components["schemas"]["User"]
type Session = components["schemas"]["Session"]

/** Renew a little before the access token expires, so no request goes out with a dead one. */
const EXPIRY_MARGIN_MS = 30_000

type State = { accessToken: string; expiresAt: number; user: User }

/**
 * Non-sensitive marker that this browser has had a session, so first-time visitors skip a refresh
 * that can only fail. It holds no token: the refresh token stays in the httpOnly cookie.
 */
const HINT_KEY = "crazy-drinks.session"
const setHint = (on: boolean) => {
  try {
    if (on) localStorage.setItem(HINT_KEY, "1")
    else localStorage.removeItem(HINT_KEY)
  } catch {
    // Storage blocked: the app still works, it just always tries the refresh.
  }
}
export const mayHaveSession = () => {
  try {
    return localStorage.getItem(HINT_KEY) === "1"
  } catch {
    return true
  }
}

let state: State | null = null
let refreshing: Promise<boolean> | null = null
const listeners = new Set<(user: User | null) => void>()

const notify = () =>
  listeners.forEach((listener) => listener(state?.user ?? null))

/**
 * Where the session lives, outside React so the API client can read it. The access token stays in
 * memory only (never localStorage); the refresh token is an httpOnly cookie JavaScript cannot read.
 */
export const sessionStore = {
  user: () => state?.user ?? null,
  hasSession: () => state !== null,
  /** The access token if it is still fresh; null if it must be renewed first. */
  freshAccessToken: () =>
    state && Date.now() < state.expiresAt - EXPIRY_MARGIN_MS
      ? state.accessToken
      : null,
  accessToken: () => state?.accessToken ?? null,
  start(session: Session) {
    state = {
      accessToken: session.accessToken,
      expiresAt: Date.now() + session.expiresIn * 1000,
      user: session.user,
    }
    setHint(true)
    notify()
  },
  updateUser(user: User) {
    if (!state) return
    state = { ...state, user }
    notify()
  },
  clear() {
    setHint(false)
    if (!state) return
    state = null
    notify()
  },
  subscribe(listener: (user: User | null) => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

/**
 * Renews the session with the refresh cookie. Concurrent callers share one request: the refresh
 * token rotates on every use, so two parallel refreshes would revoke the whole session family.
 * Resolves false when there is no valid session; network failures reject.
 */
export function refreshSession(): Promise<boolean> {
  refreshing ??= rawApi
    .POST("/v1/auth/refresh", { body: {} })
    .then((result) => {
      sessionStore.start(unwrap(result))
      return true
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError) {
        sessionStore.clear()
        return false
      }
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}
