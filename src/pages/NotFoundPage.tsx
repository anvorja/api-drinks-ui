import { Link } from "react-router"

import { LogoMark } from "@/components/brand/Logo"
import { Page } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

export default function NotFoundPage() {
  useDocumentTitle("No encontrado")
  return (
    <Page className="grid min-h-[60svh] place-items-center text-center">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-20 -rotate-12 opacity-80" />
        <p className="text-gradient font-heading text-8xl font-bold">404</p>
        <h1 className="text-2xl font-bold">Esta copa está vacía</h1>
        <p className="max-w-sm text-muted-foreground">
          La página que buscas no existe o se la tomó alguien más.
        </p>
        <div className="flex gap-2">
          <Button asChild className="rounded-full">
            <Link to="/">Ir al inicio</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/explorar">Explorar bebidas</Link>
          </Button>
        </div>
      </div>
    </Page>
  )
}
