import { createContext } from "react"

export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

/** Contract of the theme: what the provider offers and useTheme() exposes. */
export type ThemeContextValue = {
  /** What the user chose ("system" follows the operating system). */
  theme: Theme
  /** What is on screen right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  /** Flips between light and dark (leaves "system"). */
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
