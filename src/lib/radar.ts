/** Geometry of an n-axis radar chart, framework-free so it can be tested on its own. */
export type Point = { x: number; y: number }

/** Point for `value` (0-100) on axis `index` of `count`, the first axis pointing up. */
export function radarPoint(
  index: number,
  count: number,
  value: number,
  radius: number,
  center: number
): Point {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  const r = (Math.max(0, Math.min(100, value)) / 100) * radius
  return {
    x: round(center + r * Math.cos(angle)),
    y: round(center + r * Math.sin(angle)),
  }
}

export function radarPolygon(
  values: readonly number[],
  radius: number,
  center: number
): string {
  return values
    .map((value, i) => radarPoint(i, values.length, value, radius, center))
    .map(({ x, y }) => `${x},${y}`)
    .join(" ")
}

const round = (n: number) => Math.round(n * 100) / 100
