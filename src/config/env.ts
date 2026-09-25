/**
 * Runtime configuration. In the Docker image, `/config.js` sets `window.__APP_CONFIG__` from the
 * container environment, so one build serves any API. In development it comes from Vite
 * (`VITE_*` in .env.local).
 */
declare global {
  interface Window {
    __APP_CONFIG__?: { apiUrl?: string }
  }
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}: copy .env.example to .env.local`)
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
