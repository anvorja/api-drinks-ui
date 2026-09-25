import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { AnimatePresence, motion } from "motion/react"
import { useState, type FormEvent, type KeyboardEvent } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { DrinkCard, DrinkGrid } from "@/components/drinks/DrinkCard"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useMoodRecommendation,
  useMoods,
  useMyPantry,
  usePantrySuggestions,
  useSavePantry,
} from "@/hooks/api/useLab"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"

const MOOD_UI: Record<string, { label: string; emoji: string }> = {
  happy: { label: "Feliz", emoji: "😄" },
  sad: { label: "Con el ánimo bajito", emoji: "🥺" },
  romantic: { label: "En plan cita", emoji: "💘" },
  adventurous: { label: "Con ganas de aventura", emoji: "🧭" },
  chill: { label: "Tranqui", emoji: "🌿" },
  party: { label: "De rumba", emoji: "🎉" },
  focused: { label: "En modo foco", emoji: "🎧" },
  hungover: { label: "Con guayabo", emoji: "🥴" },
}

export default function LabPage() {
  useDocumentTitle("Lab")
  return (
    <Page>
      <PageHeader
        eyebrow="Laboratorio"
        title={
          <>
            Experimentos <span className="text-highlight">con sabor</span>
          </>
        }
        description="Qué preparar con lo que tienes en casa, o qué te pide el cuerpo según cómo te sientes."
      />
      <Tabs defaultValue="despensa" className="mt-8">
        <TabsList className="h-11! rounded-full p-1">
          <TabsTrigger value="despensa" className="rounded-full px-4">
            🧺 Mi despensa
          </TabsTrigger>
          <TabsTrigger value="animo" className="rounded-full px-4">
            🔮 Mi ánimo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="despensa" className="mt-8">
          <Pantry />
        </TabsContent>
        <TabsContent value="animo" className="mt-8">
          <Moods />
        </TabsContent>
      </Tabs>
    </Page>
  )
}

function Pantry() {
  const { user } = useAuth()
  const saved = useMyPantry()
  const save = useSavePantry()
  const [have, setHave] = useState<string[]>([])
  const [text, setText] = useState("")
  const suggestions = usePantrySuggestions(have)

  // Start from the saved pantry, once, if there is one.
  const [loadedSaved, setLoadedSaved] = useState(false)
  if (!loadedSaved && saved.data) {
    setLoadedSaved(true)
    if (saved.data.ingredients.length && have.length === 0)
      setHave(saved.data.ingredients)
  }

  const add = (event?: FormEvent) => {
    event?.preventDefault()
    const items = text
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i && !have.includes(i))
    if (items.length) setHave([...have, ...items])
    setText("")
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !text && have.length)
      setHave(have.slice(0, -1))
  }

  const s = suggestions.data

  return (
    <div className="space-y-10">
      <form
        onSubmit={add}
        className="rounded-3xl border border-border bg-card p-4"
      >
        <label htmlFor="ingrediente" className="text-sm text-muted-foreground">
          ¿Qué tienes? Escribe y presiona Enter (en español o inglés).
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {have.map((item) => (
              <motion.button
                key={item}
                type="button"
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                onClick={() => setHave(have.filter((h) => h !== item))}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                aria-label={`Quitar ${item}`}
              >
                {item}
                <Icon icon={Cancel01Icon} className="size-3.5" />
              </motion.button>
            ))}
          </AnimatePresence>
          <Input
            id="ingrediente"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              have.length ? "Otro más…" : "ron, limón, azúcar, hierbabuena…"
            }
            className="h-9 min-w-40 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {user && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={save.isPending}
              onClick={() =>
                save.mutate(have, {
                  onSuccess: () => toast.success("Despensa guardada"),
                  onError: (error) => toast.error(errorMessage(error)),
                })
              }
            >
              Guardar mi despensa
            </Button>
          )}
          {have.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setHave([])}
            >
              Vaciar
            </Button>
          )}
        </div>
      </form>

      {have.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title="Tu despensa está vacía"
          description="Agrega lo que tienes y te decimos qué preparar."
        />
      ) : suggestions.isError ? (
        <ErrorState error={suggestions.error} />
      ) : !s ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : (
        <div
          className={cn(
            "space-y-10 transition-opacity",
            suggestions.isPlaceholderData && "opacity-60"
          )}
        >
          {s.have.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Entendimos: {s.have.join(", ")}
            </p>
          )}
          <section>
            <h2 className="text-2xl font-bold">
              Puedes preparar{" "}
              <span className="text-highlight">{s.totals.canMake}</span>
            </h2>
            {s.canMake.length ? (
              <DrinkGrid className="mt-5">
                {s.canMake.map((drink) => (
                  <DrinkCard key={drink.id} drink={drink} />
                ))}
              </DrinkGrid>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Todavía nada completo… mira qué te falta abajo.
              </p>
            )}
          </section>
          <div className="grid gap-8 lg:grid-cols-2">
            {s.almost.length > 0 && (
              <section>
                <h2 className="text-xl font-bold">A un ingrediente</h2>
                <ul className="mt-4 space-y-2">
                  {s.almost.map((drink) => (
                    <li key={drink.id}>
                      <Link
                        to={`/bebida/${drink.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2 hover:border-amber/50"
                      >
                        <DrinkImage
                          name={drink.name}
                          image={drink.image}
                          className="size-12 rounded-xl"
                        />
                        <span className="font-medium">{drink.name}</span>
                        <span className="ml-auto pr-2 text-xs text-muted-foreground">
                          + {drink.missing.join(", ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {s.shoppingTips.length > 0 && (
              <section>
                <h2 className="text-xl font-bold">La compra que más rinde</h2>
                <ul className="mt-4 space-y-2">
                  {s.shoppingTips.map((tip) => (
                    <li
                      key={tip.buy}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <p className="font-semibold">
                        🛒 {tip.buy}{" "}
                        <span className="text-highlight">
                          desbloquea {tip.unlocks}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tip.drinks.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Moods() {
  const moods = useMoods()
  const [mood, setMood] = useState<string | null>(null)
  const recommendation = useMoodRecommendation(mood)

  if (moods.isError) return <ErrorState error={moods.error} />

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(moods.data ?? []).map((m) => {
          const ui = MOOD_UI[m.key] ?? {
            label: m.aliases[0] ?? m.key,
            emoji: "✨",
          }
          const active = mood === m.key
          return (
            <li key={m.key}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  active ? void recommendation.refetch() : setMood(m.key)
                }
                className={cn(
                  "flex h-full w-full flex-col items-start gap-2 rounded-3xl border p-4 text-left transition-all hover:-translate-y-0.5",
                  active
                    ? "border-amber bg-amber/10"
                    : "border-border bg-card hover:border-amber/50"
                )}
              >
                <span className="text-3xl" aria-hidden="true">
                  {ui.emoji}
                </span>
                <span className="font-semibold">{ui.label}</span>
                <span className="text-xs text-muted-foreground">
                  {m.description}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {mood && (
        <section aria-live="polite">
          {recommendation.isPending || recommendation.isFetching ? (
            <Skeleton className="h-72 rounded-3xl" />
          ) : recommendation.isError ? (
            <ErrorState error={recommendation.error} />
          ) : (
            <motion.div
              key={recommendation.data.drink.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[320px_1fr]"
            >
              <DrinkImage
                name={recommendation.data.drink.name}
                image={recommendation.data.drink.image}
                images={recommendation.data.drink.images}
                className="aspect-square w-full"
              />
              <div className="p-6">
                <p className="text-sm font-semibold text-highlight">
                  Para tu ánimo
                </p>
                <h2 className="mt-1 text-4xl font-bold">
                  {recommendation.data.drink.name}
                </h2>
                <p className="mt-3 text-lg text-pretty">
                  {recommendation.data.why}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild className="rounded-full">
                    <Link to={`/bebida/${recommendation.data.drink.id}`}>
                      Ver receta
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => recommendation.refetch()}
                  >
                    Dame otra 🎲
                  </Button>
                </div>
                {recommendation.data.alternatives.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      También
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {recommendation.data.alternatives.map((alt) => (
                        <li key={alt.id}>
                          <Link
                            to={`/bebida/${alt.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 text-sm hover:border-amber/50"
                          >
                            <DrinkImage
                              name={alt.name}
                              image={alt.image}
                              className="size-7 rounded-full"
                            />
                            {alt.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </section>
      )}
    </div>
  )
}
