import { cn } from "cn"
import type { ReactNode } from "react"

type PageHeaderProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-highlight uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  )
}

export function Page({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12",
        className
      )}
    >
      {children}
    </div>
  )
}
