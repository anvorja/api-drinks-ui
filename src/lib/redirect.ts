/** Only same-app paths are valid after sign-in (no open redirects to other sites). */
export function safeNext(next: string | null, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback
  return next
}
