/**
 * Runtime configuration.
 * - Docker: `/config.js` sets `window.__APP_CONFIG__` from the container environment, so one
 *   build serves any API.
 * - Development and Netlify: `VITE_API_URL`, fixed at build time. `VITE_API_URL=/` means the same
 *   origin: the host proxies /v1/* to the API (see netlify.toml), which keeps the session cookie
 *   first-party.
 */
declare global {
  interface Window {
    __APP_CONFIG__?: { apiUrl?: string }
  }
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}: copy .env.example to .env`)
  }
  return value.replace(/\/+$/, "")
}

export const config = {
  apiUrl: required(
    "VITE_API_URL",
    globalThis.window?.__APP_CONFIG__?.apiUrl || import.meta.env.VITE_API_URL
  ),
} as const

/** Paths the API returns relative to its origin (e.g. the DNA card) made absolute. */
export const apiAsset = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${config.apiUrl}${path}`

/** Demo accounts panel on the sign-in screen (for the evaluation). Off unless "true". */
export const showDemoAccounts = import.meta.env.VITE_DEMO_ACCOUNTS === "true"
