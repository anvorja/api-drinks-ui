import { isRouteErrorResponse, Link, useRouteError } from "react-router"

import { LogoMark } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"

/** Last line of defense: an unexpected render error or a failed chunk after a deploy. */
export function RouteError() {
  const error = useRouteError()
  const title = isRouteErrorResponse(error)
    ? `${error.status} · ${error.statusText}`
    : "Se nos cayó el vaso"

  return (
    <div className="grid min-h-svh place-items-center px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <LogoMark className="size-16 rotate-12" />
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          Algo falló al mostrar esta pantalla. Recarga la página; si sigue
          pasando, vuelve al inicio.
        </p>
        <div className="flex gap-2">
          <Button
            className="rounded-full"
            onClick={() => window.location.reload()}
          >
            Recargar
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
