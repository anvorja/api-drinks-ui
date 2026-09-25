/** Accepts a slug, a /adn/<slug> link or an API /v1/taste/<slug> link. */
export function slugFromInput(input: string): string | null {
  const text = input.trim()
  if (!text) return null
  const match = text.match(/(?:\/adn\/|\/taste\/)([A-Za-z0-9_-]+)/)
  if (match?.[1]) return match[1]
  return /^[A-Za-z0-9_-]+$/.test(text) ? text : null
}
