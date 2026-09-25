import { cn } from "cn"
import { NavLink } from "react-router"

import { Icon } from "@/components/common/Icon"
import { TAB_NAV } from "./nav"

/** Bottom navigation on phones, within thumb reach. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TAB_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors",
                  isActive && "text-highlight"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-7 w-12 place-items-center rounded-full transition-colors",
                      isActive && "bg-primary/15"
                    )}
                  >
                    <Icon icon={item.icon} className="size-[22px]" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
