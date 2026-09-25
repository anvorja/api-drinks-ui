import { useEffect, useState } from "react"
import { Outlet, ScrollRestoration } from "react-router"

import { MobileTabBar } from "./MobileTabBar"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"
import { SearchCommand } from "@/components/drinks/SearchCommand"

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <SiteHeader onSearch={() => setSearchOpen(true)} />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileTabBar />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <ScrollRestoration />
    </div>
  )
}
