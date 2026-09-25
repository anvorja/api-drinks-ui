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

export type NavItem = {
  to: string
  label: string
  icon: IconSvgElement
  /** Shown to signed-in people only. */
  auth?: boolean
}

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
  { to: "/mi-bar", label: "Mi bar", icon: Store01Icon, auth: true },
  { to: "/planes", label: "Planes", icon: CrownIcon },
]
