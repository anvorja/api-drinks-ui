import type { Middleware } from "openapi-fetch"

import { refreshSession, sessionStore } from "@/lib/auth/session"
import { createApiClient } from "./http"

/** Requests to retry once after renewing the session, keyed by openapi-fetch request id. */
const replays = new Map<string, Request>()

const withToken = (request: Request, token: string | null) => {
  if (token) request.headers.set("Authorization", `Bearer ${token}`)
  return request
}

/**
 * Adds the access token, renews it before it expires and, if the API still answers 401 with a
 * dead token, renews once and replays the request. Anonymous calls go out untouched.
 */
const sessionMiddleware: Middleware = {
  async onRequest({ request, id }) {
    if (!sessionStore.hasSession()) return request
    if (!sessionStore.freshAccessToken()) await refreshSession()
    withToken(request, sessionStore.accessToken())
    replays.set(id, request.clone())
    return request
  },
  async onResponse({ response, id }) {
    const replay = replays.get(id)
    replays.delete(id)
    if (response.status !== 401 || !replay) return response

    const body = (await response
      .clone()
      .json()
      .catch(() => null)) as { code?: string } | null
    if (body?.code !== "INVALID_ACCESS_TOKEN") return response
    if (!(await refreshSession())) return response
    return fetch(withToken(replay, sessionStore.accessToken()))
  },
  onError({ id }) {
    replays.delete(id)
  },
}

/** The typed API client every hook uses. */
export const api = createApiClient()
api.use(sessionMiddleware)
