import {
  CrownIcon,
  DnaIcon,
  DrinkIcon,
  GameController03Icon,
  Home09Icon,
  Search01Icon,
  Store01Icon,
  TestTube01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { User } from "@/lib/auth/session"
import { canManageVenues } from "@/lib/entitlements"

export type NavItem = {
  to: string
  label: string
  icon: IconSvgElement
  /** Shown to signed-in people only. */
  auth?: boolean
  /** Extra condition on the account (e.g. bar tools only for bar accounts). */
  visible?: (user: User) => boolean
}

/** Whether an item belongs in the menu for this person. */
export const isNavItemVisible = (item: NavItem, user: User | null) =>
  (!item.auth || user !== null) &&
  (!item.visible || (user !== null && item.visible(user)))

/** Main sections, in the order of the demo walkthrough. */
export const MAIN_NAV: NavItem[] = [
  { to: "/explorar", label: "Explorar", icon: Search01Icon },
  { to: "/descubrir", label: "Descubrir", icon: DrinkIcon },
  { to: "/mi-adn", label: "Mi ADN", icon: DnaIcon },
  { to: "/cocktle", label: "Cocktle", icon: GameController03Icon },
  { to: "/lab", label: "Lab", icon: TestTube01Icon },
]

/** The bottom bar on phones: five thumb-reachable destinations. */
export const TAB_NAV: NavItem[] = [
  { to: "/", label: "Inicio", icon: Home09Icon },
  { to: "/explorar", label: "Explorar", icon: Search01Icon },
  { to: "/descubrir", label: "Descubrir", icon: DrinkIcon },
  { to: "/cocktle", label: "Cocktle", icon: GameController03Icon },
  { to: "/mi-adn", label: "Mi ADN", icon: DnaIcon },
]

export const ACCOUNT_NAV: NavItem[] = [
  { to: "/cuenta", label: "Mi cuenta", icon: UserCircleIcon, auth: true },
  {
    to: "/mi-bar",
    label: "Mi bar",
    icon: Store01Icon,
    auth: true,
    visible: (user) => canManageVenues(user.role),
  },
  { to: "/planes", label: "Planes", icon: CrownIcon },
]
