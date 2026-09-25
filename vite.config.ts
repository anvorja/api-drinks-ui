/// <reference types="vitest/config" />
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// The dev server lives at VITE_APP_URL (http://lvh.me:5173 by default): Wompi rejects
// localhost as a return URL, and the refresh cookie only travels if the app and the API
// share the same site. See docs/desarrollo-local.md.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const appUrl = env.VITE_APP_URL ? new URL(env.VITE_APP_URL) : null

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "./src") },
    },
    server: appUrl
      ? {
          port: Number(appUrl.port) || 5173,
          strictPort: true,
          allowedHosts: [appUrl.hostname],
        }
      : undefined,
    build: {
      rollupOptions: {
        output: {
          // Long-lived vendor chunks, so a deploy of the app does not bust them.
          manualChunks(id) {
            // pnpm paths repeat peer names (…_react-dom@19/…): look at the real package only.
            const pkg = id.split("node_modules/").pop() ?? ""
            if (!id.includes("node_modules")) return undefined
            if (/^(react|react-dom|react-router|scheduler)\//.test(pkg))
              return "react"
            if (pkg.startsWith("@tanstack/")) return "query"
            if (/^(motion|framer-motion|motion-dom|motion-utils)\//.test(pkg))
              return "motion"
            if (pkg.startsWith("radix-ui/") || pkg.startsWith("@radix-ui/"))
              return "radix"
            return undefined
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      env: { VITE_API_URL: "http://api.test" },
    },
  }
})
