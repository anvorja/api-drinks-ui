import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { ThemeProvider } from "./ThemeProvider"

/** Every global provider, in dependency order (Auth needs the query client). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
