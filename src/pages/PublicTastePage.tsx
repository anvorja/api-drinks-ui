import { useState } from "react"
import { Link, useParams } from "react-router"

import { Page } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { CompatibilityResult } from "@/components/taste/Compatibility"
import { DnaRadar } from "@/components/taste/DnaRadar"
import { FlavorChips } from "@/components/taste/FlavorChips"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicTaste, useTasteShare } from "@/hooks/api/useTaste"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { STRENGTH_LABEL } from "@/lib/flavors"

/** What a friend sees when they open a shared DNA link. Works without an account. */
export default function PublicTastePage() {
  const { slug = "" } = useParams()
  const { user } = useAuth()
  const publicTaste = usePublicTaste(slug)
  const [compare, setCompare] = useState(false)
  const name = publicTaste.data?.displayName
  useDocumentTitle(name ? `El ADN de ${name}` : "ADN de sabor")

  if (publicTaste.isPending) {
    return (
      <Page>
        <Skeleton className="h-[30rem] rounded-[2rem]" />
      </Page>
    )
  }
  if (publicTaste.isError) {
    return (
      <Page>
        <ErrorState error={publicTaste.error} />
      </Page>
    )
  }

  const { displayName, taste } = publicTaste.data

  return (
    <Page className="space-y-10">
      <section className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-plum via-night to-night p-6 text-white ring-1 ring-white/10 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-amber uppercase">
            El ADN de sabor de {displayName}
          </p>
          {taste ? (
            <>
              <h1 className="mt-3 text-4xl leading-tight font-bold text-balance sm:text-5xl">
                {taste.personality}
              </h1>
              <FlavorChips
                flavors={taste.dominant}
                className="mt-5 [&_li]:border-white/20 [&_li]:bg-white/10 [&_li]:text-white"
              />
              <p className="mt-6 text-white/70">
                Prefiere lo{" "}
                {STRENGTH_LABEL[taste.preferredStrength].toLowerCase()} · basado
                en {taste.basedOn} favoritas
              </p>
            </>
          ) : (
            <h1 className="mt-3 text-4xl font-bold">
              Aún sin personalidad… 🤔
            </h1>
          )}
          <div className="mt-8">
            {user ? (
              <Button
                size="lg"
                className="h-12 rounded-full px-6"
                onClick={() => setCompare(true)}
                disabled={compare}
              >
                ¿Qué tan compatibles somos?
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 rounded-full px-6">
                <Link
                  to={`/registro?next=${encodeURIComponent(`/adn/${slug}`)}`}
                >
                  Descubre el tuyo y compárense
                </Link>
              </Button>
            )}
          </div>
        </div>
        {taste && (
          <DnaRadar
            series={[{ profile: taste.profile, label: displayName }]}
            dominant={taste.dominant}
            size={380}
            className="mx-auto w-full max-w-md [&_.fill-muted-foreground]:fill-white/60"
          />
        )}
      </section>

      {compare && <Compare slug={slug} />}
    </Page>
  )
}

function Compare({ slug }: { slug: string }) {
  const myShare = useTasteShare()
  if (myShare.data?.share?.slug === slug) {
    return (
      <EmptyState
        emoji="🪞"
        title="Este es tu propio ADN"
        description="Comparte el enlace con alguien y que se compare contigo."
      />
    )
  }
  return <CompatibilityResult slug={slug} />
}
