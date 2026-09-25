import { Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { useState } from "react"
import { Link, NavLink } from "react-router"

import { Logo } from "@/components/brand/Logo"
import { Icon } from "@/components/common/Icon"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { ACCOUNT_NAV, isNavItemVisible, MAIN_NAV } from "./nav"
import { ThemeToggle } from "./ThemeToggle"
import { UserMenu } from "./UserMenu"

type SiteHeaderProps = { onSearch: () => void }

export function SiteHeader({ onSearch }: SiteHeaderProps) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Crazy Drinks, inicio"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      isActive && "bg-secondary text-foreground"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSearch}
            className="hidden h-10 w-56 items-center gap-2 rounded-full border border-border bg-background/40 px-3.5 text-sm text-muted-foreground transition-colors hover:border-amber/50 hover:text-foreground md:flex"
          >
            <Icon icon={Search01Icon} className="size-4" />
            Buscar bebidas…
            <kbd className="ml-auto rounded-md border border-border px-1.5 font-sans text-[11px]">
              Ctrl K
            </kbd>
          </button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full md:hidden"
            onClick={onSearch}
            aria-label="Buscar"
          >
            <Icon icon={Search01Icon} />
          </Button>
          <ThemeToggle />
          <div className="hidden sm:block">
            <UserMenu />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="rounded-full lg:hidden"
                aria-label="Abrir menú"
              >
                <Icon icon={Menu01Icon} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
                <SheetDescription>
                  {user
                    ? `Hola, ${user.name.split(" ")[0]}`
                    : "Tu ADN de sabor te espera"}
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Menú" className="flex flex-col gap-1 px-4">
                {[...MAIN_NAV, ...ACCOUNT_NAV]
                  .filter((item) => isNavItemVisible(item, user))
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium transition-colors hover:bg-secondary",
                          isActive && "bg-secondary text-highlight"
                        )
                      }
                    >
                      <Icon icon={item.icon} />
                      {item.label}
                    </NavLink>
                  ))}
                <div
                  className="mt-4 sm:hidden"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserMenu />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
