import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  ThemeContext,
  type ResolvedTheme,
  type Theme,
} from "@/contexts/ThemeContext"

const STORAGE_KEY = "crazy-drinks.theme"
const DARK_QUERY = "(prefers-color-scheme: dark)"

const isTheme = (value: unknown): value is Theme =>
  value === "dark" || value === "light" || value === "system"

function readStoredTheme(fallback: Theme): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

const systemTheme = (): ResolvedTheme =>
  window.matchMedia(DARK_QUERY).matches ? "dark" : "light"

/** Swaps the class without animating every color on the page at once. */
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.add("[&_*]:transition-none")
  root.classList.toggle("dark", resolved === "dark")
  root.classList.toggle("light", resolved === "light")
  requestAnimationFrame(() => root.classList.remove("[&_*]:transition-none"))
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? "#1b1036" : "#fff7ef")
}

type ThemeProviderProps = {
  children: ReactNode
  /** Dark is the brand default: a bar at night. */
  defaultTheme?: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(defaultTheme)
  )
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)
  const resolvedTheme = theme === "system" ? system : theme

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystem(systemTheme())
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  useEffect(() => applyTheme(resolvedTheme), [resolvedTheme])

  // Another tab changed the theme.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isTheme(event.newValue)) {
        setThemeState(event.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    [resolvedTheme, setTheme]
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
