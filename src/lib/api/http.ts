import createClient from "openapi-fetch"

import { config } from "@/config/env"
import type { paths } from "./schema"

/**
 * Typed fetch for the API, generated from openapi/openapi.json. `credentials: "include"` lets the
 * httpOnly refresh cookie (Path=/v1/auth) travel; it needs the app and the API on the same site.
 */
export const createApiClient = () =>
  createClient<paths>({ baseUrl: config.apiUrl, credentials: "include" })

/** Without the session middleware: for the calls that create or renew the session itself. */
export const rawApi = createApiClient()
