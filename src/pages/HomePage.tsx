import {
  ArrowRight01Icon,
  CrownIcon,
  DnaIcon,
  DrinkIcon,
  GameController03Icon,
  Share08Icon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons"
import { motion } from "motion/react"
import { Link } from "react-router"

import { Icon } from "@/components/common/Icon"
import { Page } from "@/components/common/PageHeader"
import {
  DrinkCard,
  DrinkCardSkeleton,
  DrinkGrid,
} from "@/components/drinks/DrinkCard"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { DnaRadar } from "@/components/taste/DnaRadar"
import { FlavorChips } from "@/components/taste/FlavorChips"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDrinkDna,
  useDrinkFacets,
  useDrinkOfTheDay,
  useDrinkSearch,
} from "@/hooks/api/useDrinks"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { formatDate } from "@/lib/format"

const STEPS = [
  {
    icon: DrinkIcon,
    title: "Haz swipe",
    text: "Derecha si te provoca, izquierda si no. Cada gesto afina tu perfil.",
  },
  {
    icon: DnaIcon,
    title: "Descubre tu ADN",
    text: "Nueve sabores, una personalidad. Y recomendaciones que explican por qué.",
  },
  {
    icon: Share08Icon,
    title: "Compártelo",
    text: "Tu tarjeta lista para redes y un medidor de compatibilidad con tus amigos.",
  },
]

export default function HomePage() {
  useDocumentTitle()
  const { user, isAdult } = useAuth()
  const facets = useDrinkFacets()
  // Without an adult account the catalog is only the alcohol-free part: no count to brag about.
  const total = isAdult ? facets.data?.total : undefined

  return (
    <>
      <Hero signedIn={user !== null} total={total} />
      <Page className="space-y-24 pt-4 md:pt-4">
        <HowItWorks />
        <Features />
        <Popular adult={isAdult} />
      </Page>
    </>
  )
}

function Hero({ signedIn, total }: { signedIn: boolean; total?: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-semibold tracking-wide text-highlight">
            <span className="size-1.5 animate-pulse rounded-full bg-amber" />
            Tu ADN de sabor, en nueve dimensiones
          </p>
          <h1 className="text-5xl leading-[0.95] font-bold text-balance sm:text-6xl xl:text-7xl">
            Dime qué tomas y te diré{" "}
            <span className="text-gradient animate-shimmer">quién eres.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            No te decimos qué tomar: te decimos quién eres cuando lo tomas. Haz
            swipe entre{" "}
            {total ? (
              <strong className="text-foreground">{total}</strong>
            ) : (
              "cientos de"
            )}{" "}
            cocteles, descubre tu personalidad de sabor y encuentra tu próximo
            favorito.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-6 text-base"
            >
              <Link to={signedIn ? "/descubrir" : "/registro"}>
                {signedIn ? "Seguir descubriendo" : "Descubrir mi ADN"}
                <Icon icon={ArrowRight01Icon} className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-6 text-base"
            >
              <Link to="/explorar">Explorar la carta</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <DrinkOfTheDay />
        </motion.div>
      </div>
    </section>
  )
}

function DrinkOfTheDay() {
  const ofTheDay = useDrinkOfTheDay()
  const drink = ofTheDay.data?.drink
  const dna = useDrinkDna(drink?.id ?? "", Boolean(drink))

  if (ofTheDay.isPending) {
    return <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
  }
  if (!ofTheDay.data || !drink) return null

  return (
    <Link
      to={`/bebida/${drink.id}`}
      className="group relative block overflow-hidden rounded-[2rem] shadow-2xl ring-1 shadow-plum/40 ring-white/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <DrinkImage
        name={drink.name}
        image={drink.image}
        images={drink.images}
        priority
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
      <div className="absolute top-5 left-5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
        🌙 Coctel del día · {formatDate(ofTheDay.data.date)}
      </div>
      {dna.data && (
        <div className="absolute top-4 right-4 w-32 rounded-3xl bg-night/60 p-1 backdrop-blur-md sm:w-40">
          <DnaRadar
            series={[{ profile: dna.data.profile, label: drink.name }]}
            showLabels={false}
            size={160}
          />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="text-sm font-medium text-amber">
          {dna.data?.personality ?? drink.categoryEs}
        </p>
        <h2 className="mt-1 text-4xl font-bold">{drink.name}</h2>
        {dna.data && (
          <FlavorChips
            flavors={dna.data.dominant}
            className="mt-3 [&_li]:border-white/20 [&_li]:bg-white/10 [&_li]:text-white"
          />
        )}
      </div>
    </Link>
  )
}

function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona">
      <h2 id="como-funciona" className="text-3xl font-bold sm:text-4xl">
        Tres gestos, <span className="text-highlight">un perfil</span>
      </h2>
      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card p-6"
          >
            <span className="absolute -top-4 -right-2 font-heading text-8xl font-bold text-foreground/5">
              {i + 1}
            </span>
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-coral to-amber text-night">
              <Icon icon={step.icon} className="size-6" />
            </span>
            <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-muted-foreground">{step.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

function Features() {
  return (
    <section aria-labelledby="mas" className="grid gap-4 md:grid-cols-6">
      <h2 id="mas" className="sr-only">
        Más para jugar
      </h2>
      <FeatureTile
        to="/cocktle"
        className="bg-gradient-to-br from-plum via-night to-night text-white md:col-span-4"
        icon={GameController03Icon}
        eyebrow="Reto diario"
        title="Cocktle"
        text="Adivina el coctel del día con pistas y un termómetro de sabor. Seis intentos, rachas y resultado sin spoilers."
      >
        <div className="mt-6 flex gap-1.5" aria-hidden="true">
          {[
            "bg-heat-cold",
            "bg-heat-warm",
            "bg-heat-hot",
            "bg-heat-correct",
          ].map((c, i) => (
            <motion.span
              key={c}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.12, type: "spring" }}
              className={`size-9 rounded-xl ${c}`}
            />
          ))}
        </div>
      </FeatureTile>
      <FeatureTile
        to="/lab"
        className="md:col-span-2"
        icon={TestTube01Icon}
        eyebrow="Laboratorio"
        title="¿Qué hay en tu nevera?"
        text="Dinos qué tienes y te decimos qué preparar. O cuéntanos cómo te sientes."
      />
      <FeatureTile
        to="/planes"
        className="border-amber/40 bg-gradient-to-r from-amber/15 via-coral/10 to-transparent md:col-span-6"
        icon={CrownIcon}
        eyebrow="Para bares"
        title="Tu carta, con costos y margen"
        text="Registra tu inventario y te decimos qué cocteles puedes servir hoy, cuánto te cuestan, a cuánto venderlos y qué comprar para ampliar la carta."
      />
    </section>
  )
}

function FeatureTile({
  to,
  icon,
  eyebrow,
  title,
  text,
  className,
  children,
}: {
  to: string
  icon: Parameters<typeof Icon>[0]["icon"]
  eyebrow: string
  title: string
  text: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-amber/50 sm:p-8 ${className ?? ""}`}
    >
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-amber uppercase">
        <Icon icon={icon} className="size-4" />
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h3>
      <p className="mt-2 max-w-xl opacity-80">{text}</p>
      {children}
      <Icon
        icon={ArrowRight01Icon}
        className="absolute right-6 bottom-6 size-6 opacity-40 transition-all group-hover:translate-x-1 group-hover:opacity-100"
      />
    </Link>
  )
}

function Popular({ adult }: { adult: boolean }) {
  // IBA classics all carry alcohol: without an adult account, show the alcohol-free side.
  const section = adult
    ? {
        filters: { iba: "true" as const },
        title: "Los clásicos de la IBA",
        text: "Los que todo bar que se respete sabe preparar.",
        to: "/explorar?iba=true",
      }
    : {
        filters: { alcoholic: "false" as const },
        title: "Sin alcohol, con carácter",
        text: "Para todas las edades y todas las mañanas después.",
        to: "/explorar?alcoholic=false",
      }
  const drinks = useDrinkSearch(section.filters)
  const items = drinks.data?.pages[0]?.items.slice(0, 10) ?? []

  return (
    <section aria-labelledby="destacadas">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="destacadas" className="text-3xl font-bold sm:text-4xl">
            {section.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{section.text}</p>
        </div>
        <Button asChild variant="ghost" className="shrink-0 rounded-full">
          <Link to={section.to}>
            Ver todos <Icon icon={ArrowRight01Icon} className="size-4" />
          </Link>
        </Button>
      </div>
      <DrinkGrid className="mt-8">
        {drinks.isPending
          ? Array.from({ length: 10 }, (_, i) => <DrinkCardSkeleton key={i} />)
          : items.map((drink) => <DrinkCard key={drink.id} drink={drink} />)}
      </DrinkGrid>
    </section>
  )
}
