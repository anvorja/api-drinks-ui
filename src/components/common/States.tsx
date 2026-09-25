import {
  Alert02Icon,
  CrownIcon,
  Login01Icon,
  SquareLock01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { cn } from "cn"
import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"

import { Button } from "@/components/ui/button"
import { ApiError, errorMessage } from "@/lib/api/errors"
import { Icon } from "./Icon"

type EmptyStateProps = {
  icon?: IconSvgElement
  emoji?: string
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      {emoji ? (
        <span className="text-5xl" aria-hidden="true">
          {emoji}
        </span>
      ) : (
        icon && (
          <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-highlight">
            <Icon icon={icon} className="size-7" />
          </span>
        )
      )}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="max-w-md text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/**
 * Turns an API error into the right screen: age gate, plan upsell, sign-in prompt or a retry.
 * Decides by `code`, as the API asks.
 */
export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: unknown
  onRetry?: () => void
  className?: string
}) {
  const location = useLocation()
  const code = error instanceof ApiError ? error.code : undefined
  const next = encodeURIComponent(location.pathname + location.search)

  if (code === "AGE_RESTRICTED") {
    return (
      <EmptyState
        className={className}
        icon={SquareLock01Icon}
        title="Solo para mayores de 18"
        description="Esta bebida lleva alcohol. Entra con una cuenta verificada como mayor de edad para verla, o explora nuestras bebidas sin alcohol."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-full">
              <Link to={`/entrar?next=${next}`}>Entrar</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/explorar?alcoholic=false">Ver sin alcohol</Link>
            </Button>
          </div>
        }
      />
    )
  }
  if (code === "PLAN_LIMIT") {
    return (
      <EmptyState
        className={className}
        icon={CrownIcon}
        title="Esto es del plan Pro"
        description={errorMessage(error)}
        action={
          <Button asChild className="rounded-full">
            <Link to="/planes">Ver planes</Link>
          </Button>
        }
      />
    )
  }
  if (
    code === "AUTH_REQUIRED" ||
    code === "INVALID_ACCESS_TOKEN" ||
    code === "INVALID_REFRESH_TOKEN"
  ) {
    return (
      <EmptyState
        className={className}
        icon={Login01Icon}
        title="Inicia sesión"
        description={errorMessage(error)}
        action={
          <Button asChild className="rounded-full">
            <Link to={`/entrar?next=${next}`}>Entrar</Link>
          </Button>
        }
      />
    )
  }
  return (
    <EmptyState
      className={className}
      icon={Alert02Icon}
      title="Algo no salió bien"
      description={
        <>
          {errorMessage(error)}
          {error instanceof ApiError && error.requestId && (
            <span className="mt-2 block font-mono text-xs opacity-70">
              Ref: {error.requestId}
            </span>
          )}
        </>
      }
      action={
        onRetry && (
          <Button variant="outline" className="rounded-full" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    />
  )
}
