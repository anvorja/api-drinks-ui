import {
  Cancel01Icon,
  FavouriteIcon,
  StarIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import {
  SwipeCard,
  type SwipeCardHandle,
} from "@/components/discover/SwipeCard"
import { DnaRadar } from "@/components/taste/DnaRadar"
import { FlavorChips } from "@/components/taste/FlavorChips"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { DrinkCard, Reaction, TasteProfile } from "@/hooks/api/types"
import {
  useDiscoverDeck,
  useDiscoverStats,
  useReact,
  useUndoReaction,
} from "@/hooks/api/useDiscover"
import { useMyTaste } from "@/hooks/api/useTaste"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"

const REFILL_AT = 3

export default function DiscoverPage() {
  useDocumentTitle("Descubrir")
  const deck = useDiscoverDeck()
  const stats = useDiscoverStats()
  const myTaste = useMyTaste()
  const react = useReact()
  const undo = useUndoReaction()

  const [queue, setQueue] = useState<DrinkCard[]>([])
  const [history, setHistory] = useState<
    { drink: DrinkCard; reaction: Reaction }[]
  >([])
  const [liveTaste, setLiveTaste] = useState<TasteProfile | null>(null)
  const seen = useRef(new Set<string>())
  const topCard = useRef<SwipeCardHandle>(null)
  const busy = useRef(false)

  // Append fresh cards from each deck load, never repeating one already shown.
  useEffect(() => {
    if (!deck.data) return
    const fresh = deck.data.filter((d) => !seen.current.has(d.id))
    fresh.forEach((d) => seen.current.add(d.id))
    if (fresh.length) setQueue((q) => [...q, ...fresh])
  }, [deck.data])

  const { refetch, isFetching } = deck
  const onSwiped = useCallback(
    (drink: DrinkCard, reaction: Reaction) => {
      setQueue((q) => q.filter((d) => d.id !== drink.id))
      // Running low: ask for more (the API leaves out what was already swiped).
      if (queue.length - 1 <= REFILL_AT && !isFetching) void refetch()
      setHistory((h) => [...h.slice(-19), { drink, reaction }])
      busy.current = false
      react.mutate(
        { drinkId: drink.id, reaction },
        {
          onSuccess: (result) => {
            if (result.taste) setLiveTaste(result.taste)
            if (reaction === "superlike")
              toast.success(`${drink.name} a favoritos ⭐`)
          },
          onError: (error) => toast.error(errorMessage(error)),
        }
      )
    },
    [react, queue.length, isFetching, refetch]
  )

  const decide = useCallback(async (reaction: Reaction) => {
    if (busy.current || !topCard.current) return
    busy.current = true
    await topCard.current.swipe(reaction)
  }, [])

  const onUndo = useCallback(() => {
    const last = history.at(-1)
    if (!last || undo.isPending) return
    setHistory((h) => h.slice(0, -1))
    setQueue((q) => [last.drink, ...q])
    undo.mutate(last.drink.id, {
      onError: (error) => toast.error(errorMessage(error)),
    })
  }, [history, undo])

  // Keyboard: ← paso, → me provoca, ↑ súper, Z / Backspace deshacer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      const actions: Record<string, () => void> = {
        ArrowLeft: () => void decide("dislike"),
        ArrowRight: () => void decide("like"),
        ArrowUp: () => void decide("superlike"),
        Backspace: onUndo,
        z: onUndo,
      }
      const action = actions[event.key]
      if (action) {
        event.preventDefault()
        action()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [decide, onUndo])

  const taste = liveTaste ?? myTaste.data?.taste ?? null

  return (
    <Page className="pt-6 pb-28 md:pt-12">
      <PageHeader
        eyebrow="Descubrir"
        title={
          <>
            ¿Te provoca <span className="text-highlight">o pasas?</span>
          </>
        }
        description={
          <span className="hidden sm:inline">
            Siete de cada diez cartas van con tu gusto; las otras tres son para
            sorprenderte.
          </span>
        }
      />

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <section
          aria-label="Mazo de bebidas"
          className="mx-auto w-full max-w-sm"
        >
          {/* On phones the height is capped so the buttons stay above the tab bar. */}
          <div className="relative mx-auto h-[min(50svh,32rem)] w-full sm:aspect-[3/4.2] sm:h-auto">
            {deck.isPending ? (
              <Skeleton className="absolute inset-0 rounded-[2rem]" />
            ) : deck.isError && queue.length === 0 ? (
              <ErrorState error={deck.error} onRetry={() => deck.refetch()} />
            ) : queue.length === 0 ? (
              <EmptyState
                className="absolute inset-0 justify-center"
                emoji="🎉"
                title="¡Viste todo el mazo!"
                description="Mira en qué se convirtió tu ADN de sabor."
                action={
                  <Button asChild className="rounded-full">
                    <Link to="/mi-adn">Ver mi ADN</Link>
                  </Button>
                }
              />
            ) : (
              <AnimatePresence initial={false}>
                {queue.slice(0, 3).map((drink, depth) => (
                  <SwipeCard
                    key={drink.id}
                    ref={depth === 0 ? topCard : undefined}
                    drink={drink}
                    depth={depth}
                    onSwiped={(reaction) => onSwiped(drink, reaction)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
            <RoundAction
              label="Deshacer"
              onClick={onUndo}
              disabled={!history.length}
              size="sm"
            >
              <Icon icon={Undo02Icon} className="size-5" />
            </RoundAction>
            <RoundAction
              label="Paso"
              onClick={() => decide("dislike")}
              disabled={!queue.length}
              className="text-heat-cold hover:bg-heat-cold/10"
            >
              <Icon icon={Cancel01Icon} className="size-7" strokeWidth={2.4} />
            </RoundAction>
            <RoundAction
              label="¡Súper! (a favoritos)"
              onClick={() => decide("superlike")}
              disabled={!queue.length}
              size="sm"
              className="text-amber hover:bg-amber/10"
            >
              <Icon icon={StarIcon} className="size-5 fill-current" />
            </RoundAction>
            <RoundAction
              label="Me provoca"
              onClick={() => decide("like")}
              disabled={!queue.length}
              className="text-success hover:bg-success/10"
            >
              <Icon icon={FavouriteIcon} className="size-7 fill-current" />
            </RoundAction>
          </div>
          <p className="mt-4 hidden text-center text-xs text-muted-foreground md:block">
            Teclado: ← paso · → me provoca · ↑ súper · Z deshacer
          </p>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <LiveTaste taste={taste} />
          {stats.data && (
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Me provoca", stats.data.likes, "text-success"],
                ["Súper", stats.data.superlikes, "text-amber"],
                ["Paso", stats.data.dislikes, "text-heat-cold"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-card p-3"
                >
                  <dd className={cn("font-heading text-2xl font-bold", color)}>
                    {value}
                  </dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </aside>
      </div>
    </Page>
  )
}

function LiveTaste({ taste }: { taste: TasteProfile | null }) {
  return (
    <section
      aria-live="polite"
      className="rounded-3xl border border-border bg-card p-5"
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Tu ADN, en vivo
      </p>
      <AnimatePresence mode="wait">
        {taste ? (
          <motion.div
            key={taste.personality}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mt-2 text-xl font-bold text-balance">
              {taste.personality}
            </h2>
            <FlavorChips flavors={taste.dominant} className="mt-3" />
          </motion.div>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Dale “me provoca” a unas cuantas y aquí aparece tu personalidad.
          </p>
        )}
      </AnimatePresence>
      {taste && (
        <DnaRadar
          series={[{ profile: taste.profile, label: "Tú" }]}
          dominant={taste.dominant}
          size={300}
          className="mx-auto mt-2 max-w-[18rem]"
        />
      )}
      <Button asChild variant="outline" className="mt-2 w-full rounded-full">
        <Link to="/mi-adn">Ver mi ADN completo</Link>
      </Button>
    </section>
  )
}

function RoundAction({
  label,
  onClick,
  disabled,
  size = "lg",
  className,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  size?: "sm" | "lg"
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.06 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid place-items-center rounded-full border border-border bg-card shadow-lg transition-colors disabled:opacity-40",
        size === "lg" ? "size-16" : "size-12 text-muted-foreground",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
