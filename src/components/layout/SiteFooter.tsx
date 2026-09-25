import { Link } from "react-router"

import { LogoMark } from "@/components/brand/Logo"

/** Attribution to TheCocktailDB is required wherever drinks are shown. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 pb-24 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="size-8" />
          <p className="max-w-sm text-sm text-muted-foreground">
            No te decimos qué tomar: te decimos quién eres cuando lo tomas.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground md:items-end">
          <p>
            Datos e imágenes:{" "}
            <a
              href="https://www.thecocktaildb.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              TheCocktailDB
            </a>
          </p>
          <p>
            🍹 Disfruta con moderación. Prohibida la venta de alcohol a menores
            de edad. ·{" "}
            <Link to="/planes" className="underline-offset-4 hover:underline">
              Planes
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
