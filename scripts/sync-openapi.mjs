// Downloads the API contract into openapi/openapi.json (then run `pnpm api:types`).
// Source: OPENAPI_URL, or VITE_API_URL + /docs/openapi.json from .env.local / .env.
import { existsSync, writeFileSync } from "node:fs"

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file)
}
const url =
  process.env.OPENAPI_URL ??
  (process.env.VITE_API_URL && `${process.env.VITE_API_URL}/docs/openapi.json`)
if (!url) {
  console.error("Set OPENAPI_URL or VITE_API_URL (see .env.example)")
  process.exit(1)
}

const response = await fetch(url)
if (!response.ok) {
  console.error(`GET ${url} → ${response.status}`)
  process.exit(1)
}
const spec = await response.json()
writeFileSync("openapi/openapi.json", `${JSON.stringify(spec, null, 2)}\n`)
console.log(`openapi/openapi.json ← ${url} (API ${spec.info?.version ?? "?"})`)
