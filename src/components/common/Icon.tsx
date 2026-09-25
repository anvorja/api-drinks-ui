import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "cn"

type IconProps = {
  icon: IconSvgElement
  className?: string
  strokeWidth?: number
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string
}

export function Icon({ icon, className, strokeWidth = 1.8, label }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={strokeWidth}
      className={cn("size-5 shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  )
}
