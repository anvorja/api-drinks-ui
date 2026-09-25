import { useState, type FormEvent } from "react"
import { Link } from "react-router"

import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { CompatibilityResult } from "@/components/taste/Compatibility"
import { DnaRadar } from "@/components/taste/DnaRadar"
import { FlavorChips } from "@/components/taste/FlavorChips"
import { SharePanel } from "@/components/taste/SharePanel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { TasteProfile } from "@/hooks/api/types"
import { useMyTaste, useTasteRecommendations } from "@/hooks/api/useTaste"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { CONFIDENCE_LABEL, STRENGTH_LABEL } from "@/lib/flavors"
import { slugFromInput } from "@/lib/taste"

export default function MyTastePage() {
  useDocumentTitle("Mi ADN")
  const myTaste = useMyTaste()

  return (
    <Page>
      {myTaste.isPending ? (
        <Skeleton className="h-[28rem] rounded-[2rem]" />
      ) : myTaste.isError ? (
        <ErrorState error={myTaste.error} onRetry={() => myTaste.refetch()} />
      ) : !myTaste.data.taste ? (
        <>
          <PageHeader eyebrow="Mi ADN" title="Tu ADN de sabor" />
          <EmptyState
            className="mt-8"
            emoji="🧬"
            title="Todavía no te conocemos"
            description={
              myTaste.data.hint ??
              "Dale “me provoca” a unas cuantas bebidas y aquí aparece tu personalidad."
            }
            action={
              <Button asChild size="lg" className="rounded-full">
                <Link to="/descubrir">Empezar a hacer swipe</Link>
              </Button>
            }
          />
        </>
      ) : (
        <TasteView taste={myTaste.data.taste} />
      )}
    </Page>
  )
}

function TasteView({ taste }: { taste: TasteProfile }) {
  return (
    <div className="space-y-16">
      <section className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-plum via-night to-night p-6 text-white ring-1 ring-white/10 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-amber uppercase">
            Tu ADN de sabor
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-bold text-balance sm:text-5xl">
            {taste.personality}
          </h1>
          <FlavorChips
            flavors={taste.dominant}
            className="mt-5 [&_li]:border-white/20 [&_li]:bg-white/10 [&_li]:text-white"
          />
          <dl className="mt-8 grid grid-cols-2 gap-3 text-sm sm:max-w-md">
            <Stat
              label="Intensidad preferida"
              value={STRENGTH_LABEL[taste.preferredStrength]}
            />
            <Stat label="Basado en" value={`${taste.basedOn} favoritas`} />
          </dl>
          <p className="mt-4 text-sm text-white/70">
            {CONFIDENCE_LABEL[taste.confidence]}
            {taste.confidence !== "high" && (
              <>
                {" · "}
                <Link
                  to="/descubrir"
                  className="font-medium text-amber underline-offset-4 hover:underline"
                >
                  afínalo con más swipes
                </Link>
              </>
            )}
          </p>
        </div>
        <DnaRadar
          series={[{ profile: taste.profile, label: "Tú" }]}
          dominant={taste.dominant}
          size={380}
          className="mx-auto w-full max-w-md [&_.fill-muted-foreground]:fill-white/60"
        />
      </section>

      {taste.favoriteIngredients.length > 0 && (
        <section aria-labelledby="ingredientes-favoritos">
          <h2 id="ingredientes-favoritos" className="text-2xl font-bold">
            Lo que siempre te gana
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {taste.favoriteIngredients.slice(0, 10).map((i) => (
              <li key={i.ingredient}>
                <Link
                  to={`/explorar?ingredients=${encodeURIComponent(i.ingredient)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-amber/60"
                >
                  {i.ingredient}
                  <span className="rounded-full bg-muted px-2 text-xs">
                    ×{i.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Recommendations />

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="compartir">
          <h2 id="compartir" className="mb-4 text-2xl font-bold">
            Compártelo
          </h2>
          <SharePanel />
        </section>
        <CompatibilitySection />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-heading text-lg font-semibold">{value}</dd>
    </div>
  )
}

function Recommendations() {
  const recommendations = useTasteRecommendations()
  const items = recommendations.data?.recommendations ?? []

  return (
    <section aria-labelledby="para-ti">
      <h2 id="para-ti" className="text-2xl font-bold">
        Hechas para ti
      </h2>
      <p className="mt-1 text-muted-foreground">Y te decimos por qué.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.isPending
          ? Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
            ))
          : items.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/bebida/${r.id}`}
                  className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-amber/50"
                >
                  <div className="relative">
                    <DrinkImage
                      name={r.name}
                      image={r.image}
                      className="aspect-[4/3] w-full"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-night/75 px-2.5 py-1 font-heading text-sm font-bold text-amber backdrop-blur">
                      {r.match} % match
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{r.name}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {r.reasons.slice(0, 2).map((reason) => (
                        <li key={reason} className="flex gap-2">
                          <span className="text-highlight" aria-hidden="true">
                            ✦
                          </span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  )
}

function CompatibilitySection() {
  const [input, setInput] = useState("")
  const [slug, setSlug] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsed = slugFromInput(input)
    setInvalid(!parsed)
    setSlug(parsed)
  }

  return (
    <section aria-labelledby="compatibilidad">
      <h2 id="compatibilidad" className="mb-4 text-2xl font-bold">
        ¿Qué tan compatibles son?
      </h2>
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-border bg-card p-5"
      >
        <label htmlFor="amigo" className="text-sm text-muted-foreground">
          Pega el enlace del ADN de alguien
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="amigo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://…/adn/laura-demo-adn"
            className="h-11 rounded-full bg-background/50 px-4"
            aria-invalid={invalid || undefined}
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-full"
            disabled={!input.trim()}
          >
            Comparar
          </Button>
        </div>
        {invalid && (
          <p className="mt-2 text-sm text-destructive">
            Ese enlace no parece un ADN.
          </p>
        )}
      </form>
      {slug && (
        <div className="mt-4">
          <CompatibilityResult slug={slug} />
        </div>
      )}
    </section>
  )
}
