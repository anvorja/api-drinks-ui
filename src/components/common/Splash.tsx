import { LogoMark } from "@/components/brand/Logo"

/** While the session is recovered from the cookie (usually a blink). */
export function Splash() {
  return (
    <div
      className="grid min-h-svh place-items-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <LogoMark className="size-16 animate-float" />
        <span className="sr-only">Cargando…</span>
      </div>
    </div>
  )
}
