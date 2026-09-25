import { ArrowLeft01Icon, Share08Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Page } from "@/components/common/PageHeader"
import { ErrorState } from "@/components/common/States"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { FavoriteButton } from "@/components/drinks/FavoriteButton"
import { DnaRadar } from "@/components/taste/DnaRadar"
import { FlavorChips } from "@/components/taste/FlavorChips"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Drink } from "@/hooks/api/types"
import { useDrink, useDrinkDna, useDrinkTwins } from "@/hooks/api/useDrinks"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { STRENGTH_LABEL } from "@/lib/flavors"

export default function DrinkPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const drink = useDrink(id)
  useDocumentTitle(drink.data?.name)

  return (
    <Page className="pt-6">
      <Button
        variant="ghost"
        className="-ml-3 rounded-full"
        onClick={() =>
          history.length > 1 ? navigate(-1) : navigate("/explorar")
        }
      >
        <Icon icon={ArrowLeft01Icon} className="size-4" /> Volver
      </Button>

      {drink.isPending ? (
        <DrinkSkeleton />
      ) : drink.isError ? (
        <ErrorState
          className="mt-6"
          error={drink.error}
          onRetry={() => drink.refetch()}
        />
      ) : (
        <DrinkDetail drink={drink.data} />
      )}
    </Page>
  )
}

function DrinkDetail({ drink }: { drink: Drink }) {
  const [lang, setLang] = useState<"es" | "en">(
    drink.instructions.es ? "es" : "en"
  )
  const instructions = drink.instructions[lang] ?? drink.instructions.en

  const share = async () => {
    const data = { title: drink.name, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(data.url)
        toast.success("Enlace copiado")
      }
    } catch {
      // Share sheet closed.
    }
  }

  return (
    <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-border">
          <DrinkImage
            name={drink.name}
            image={drink.image}
            images={drink.images}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-square w-full"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <FavoriteButton drinkId={drink.id} className="flex-1" />
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={share}
            aria-label="Compartir"
          >
            <Icon icon={Share08Icon} className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-w-0 space-y-10">
        <header>
          <div className="flex flex-wrap gap-2">
            <Tag>{drink.categoryEs ?? drink.category}</Tag>
            <Tag>{drink.glassEs ?? drink.glass}</Tag>
            {drink.iba && <Tag accent>IBA · {drink.iba}</Tag>}
            <Tag accent={!drink.alcoholic}>
              {drink.alcoholic ? "Con alcohol" : "Sin alcohol"}
            </Tag>
          </div>
          <h1 className="mt-4 text-5xl font-bold text-balance md:text-6xl">
            {drink.name}
          </h1>
        </header>

        <DrinkDna id={drink.id} name={drink.name} />

        <section aria-labelledby="ingredientes">
          <h2 id="ingredientes" className="text-2xl font-bold">
            Ingredientes
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {drink.ingredients.map((ingredient) => (
              <li
                key={ingredient.name}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5"
              >
                {ingredient.image ? (
                  <img
                    src={ingredient.image}
                    alt=""
                    loading="lazy"
                    className="size-12 rounded-xl bg-white object-contain p-1"
                  />
                ) : (
                  <span className="size-12 rounded-xl bg-muted" />
                )}
                <div className="min-w-0">
                  <Link
                    to={`/explorar?ingredients=${encodeURIComponent(ingredient.name)}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {ingredient.nameEs ?? ingredient.name}
                  </Link>
                  {ingredient.measure && (
                    <p className="text-sm text-muted-foreground">
                      {ingredient.measure}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="preparacion">
          <div className="flex items-center justify-between gap-4">
            <h2 id="preparacion" className="text-2xl font-bold">
              Preparación
            </h2>
            <div className="inline-flex rounded-full bg-muted p-1" role="group">
              {(["es", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  disabled={!drink.instructions[code]}
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase disabled:opacity-40",
                    lang === code && "bg-background shadow-sm dark:bg-secondary"
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
          <p lang={lang} className="mt-4 text-lg leading-relaxed text-pretty">
            {instructions ?? "Sin instrucciones."}
          </p>
          {drink.video && (
            <a
              href={drink.video}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-highlight underline-offset-4 hover:underline"
            >
              Ver el video de preparación ↗
            </a>
          )}
        </section>

        <Twins id={drink.id} />
      </div>
    </div>
  )
}

function DrinkDna({ id, name }: { id: string; name: string }) {
  const dna = useDrinkDna(id)
  if (dna.isPending) return <Skeleton className="h-72 rounded-3xl" />
  if (!dna.data) return null
  const { profile, dominant, personality, strength, complexity } = dna.data

  return (
    <section
      aria-labelledby="adn-bebida"
      className="grid items-center gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[1fr_1.1fr]"
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          ADN de la bebida
        </p>
        <h2 id="adn-bebida" className="mt-2 text-2xl font-bold text-balance">
          {personality}
        </h2>
        <FlavorChips flavors={dominant} className="mt-4" />
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-muted p-3">
            <dt className="text-muted-foreground">Intensidad</dt>
            <dd className="font-heading text-lg font-semibold">
              {STRENGTH_LABEL[strength]}
            </dd>
          </div>
          <div className="rounded-2xl bg-muted p-3">
            <dt className="text-muted-foreground">Complejidad</dt>
            <dd className="font-heading text-lg font-semibold">
              {complexity} ingredientes
            </dd>
          </div>
        </dl>
      </div>
      <DnaRadar
        series={[{ profile, label: name }]}
        dominant={dominant}
        className="mx-auto w-full max-w-xs"
      />
    </section>
  )
}

function Twins({ id }: { id: string }) {
  const twins = useDrinkTwins(id)
  if (!twins.data?.twins.length) return null

  return (
    <section aria-labelledby="gemelas">
      <h2 id="gemelas" className="text-2xl font-bold">
        Gemelas de sabor
      </h2>
      <p className="mt-1 text-muted-foreground">
        Si te gusta esta, estas se le parecen.
      </p>
      <ul className="-mx-4 mt-4 flex snap-x scrollbar-none gap-3 overflow-x-auto px-4 pb-2">
        {twins.data.twins.map((twin) => (
          <li key={twin.id} className="w-40 shrink-0 snap-start">
            <Link to={`/bebida/${twin.id}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl">
                <DrinkImage
                  name={twin.name}
                  image={twin.image}
                  className="aspect-square w-full transition-transform group-hover:scale-105"
                />
                <span className="absolute top-2 right-2 rounded-full bg-night/70 px-2 py-0.5 text-xs font-bold text-amber backdrop-blur">
                  {twin.similarity} %
                </span>
              </div>
              <p className="mt-2 line-clamp-1 font-medium">{twin.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Tag({
  children,
  accent,
}: {
  children: React.ReactNode
  accent?: boolean
}) {
  if (!children) return null
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        accent
          ? "border-amber/40 bg-amber/10 text-highlight"
          : "border-border text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}

function DrinkSkeleton() {
  return (
    <div className="mt-4 grid gap-10 lg:grid-cols-[5fr_7fr]">
      <Skeleton className="aspect-square rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  )
}
