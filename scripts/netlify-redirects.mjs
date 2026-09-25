// Writes dist/_redirects for Netlify after the build:
// - /v1/* is proxied to the API (API_ORIGIN), so the browser sees the API on the same origin as
//   the app and the httpOnly refresh cookie (SameSite=Lax, Path=/v1/auth) keeps working.
//   netlify.app and onrender.com are different sites: without the proxy the cookie would be
//   third-party and browsers block it.
// - Every other path falls back to index.html (single-page app).
import { writeFileSync } from "node:fs"

const origin = process.env.API_ORIGIN?.replace(/\/+$/, "")
if (!origin || !/^https:\/\/[^/]+$/.test(origin)) {
  console.error(
    "Set API_ORIGIN to the API origin, e.g. https://api-drinks.onrender.com"
  )
  process.exit(1)
}

writeFileSync(
  "dist/_redirects",
  [`/v1/*  ${origin}/v1/:splat  200`, "/*  /index.html  200", ""].join("\n")
)
console.log(`dist/_redirects: /v1/* → ${origin}`)
