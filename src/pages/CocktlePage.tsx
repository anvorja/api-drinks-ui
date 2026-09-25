import { Copy01Icon, SquareLock01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { GuessInput } from "@/components/cocktle/GuessInput"
import { HEAT } from "@/components/cocktle/heat"
import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { ErrorState } from "@/components/common/States"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CocktleGame, CocktleGuess, CocktleMode } from "@/hooks/api/types"
import {
  useCocktleGuess,
  useCocktleStats,
  useCocktleToday,
} from "@/hooks/api/useCocktle"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"

export default function CocktlePage() {
  useDocumentTitle("Cocktle")
  const { isAdult } = useAuth()
  const [mode, setMode] = useState<CocktleMode>(isAdult ? "classic" : "zero")
  const game = useCocktleToday(mode)

  return (
    <Page>
      <PageHeader
        eyebrow="Reto diario"
        title={
          <>
            Cocktle <span className="text-highlight">del día</span>
          </>
        }
        description="Adivina el coctel secreto. Cada fallo revela una pista nueva y el termómetro te dice qué tan cerca estuviste."
        actions={
          <ModeSwitch mode={mode} onChange={setMode} isAdult={isAdult} />
        }
      />

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        {game.isPending ? (
          <Skeleton className="h-[28rem] rounded-3xl" />
        ) : game.isError ? (
          <ErrorState error={game.error} onRetry={() => game.refetch()} />
        ) : (
          <Board game={game.data} mode={mode} />
        )}
        <Stats mode={mode} />
      </div>
    </Page>
  )
}

function ModeSwitch({
  mode,
  onChange,
  isAdult,
}: {
  mode: CocktleMode
  onChange: (mode: CocktleMode) => void
  isAdult: boolean
}) {
  const options: { value: CocktleMode; label: string; locked?: boolean }[] = [
    { value: "classic", label: "Clásico", locked: !isAdult },
    { value: "zero", label: "Zero · sin alcohol" },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Modo"
      className="inline-flex rounded-full bg-muted p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          disabled={option.locked}
          title={option.locked ? "Solo para mayores de 18" : undefined}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all disabled:cursor-not-allowed disabled:opacity-50",
            mode === option.value &&
              "bg-background text-foreground shadow-sm dark:bg-secondary"
          )}
        >
          {option.locked && (
            <Icon icon={SquareLock01Icon} className="size-3.5" />
          )}
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Board({ game, mode }: { game: CocktleGame; mode: CocktleMode }) {
  const guess = useCocktleGuess(mode)

  const onGuess = (drinkId: string) =>
    guess.mutate(drinkId, {
      onSuccess: (next) => {
        const last = next.guesses.at(-1)
        if (next.solved) toast.success("¡La tienes! 🎉")
        else if (last && !next.finished)
          toast(`${HEAT[last.heat].emoji} ${HEAT[last.heat].label}`)
      },
      onError: (error) => toast.error(errorMessage(error)),
    })

  return (
    <section aria-label="Tablero" className="space-y-6">
      <Attempts game={game} />

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Pistas
        </h2>
        <ol className="mt-3 space-y-2">
          <AnimatePresence initial={false}>
            {game.clues.map((clue, i) => (
              <motion.li
                key={`${clue.kind}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 rounded-2xl bg-muted px-4 py-3"
              >
                <span className="font-heading font-bold text-highlight">
                  {i + 1}
                </span>
                <span>{clue.text}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>

      {game.finished ? (
        <Result game={game} />
      ) : (
        <GuessInput
          disabled={guess.isPending}
          exclude={game.guesses.map((g) => g.drink.id)}
          onGuess={onGuess}
        />
      )}

      <ol className="space-y-3" aria-label="Tus intentos">
        <AnimatePresence initial={false}>
          {[...game.guesses].reverse().map((g) => (
            <GuessRow key={g.drink.id} guess={g} />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  )
}

function Attempts({ game }: { game: CocktleGame }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className="flex gap-1.5"
        aria-label={`${game.attemptsLeft} intentos restantes`}
      >
        {Array.from({ length: game.maxAttempts }, (_, i) => {
          const g = game.guesses[i]
          return (
            <span
              key={i}
              className={cn(
                "size-7 rounded-lg border border-border transition-colors sm:size-9",
                g && HEAT[g.heat].className
              )}
            />
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        {game.finished ? "Terminado" : `${game.attemptsLeft} intentos`}
      </p>
    </div>
  )
}

function GuessRow({ guess }: { guess: CocktleGuess }) {
  const heat = HEAT[guess.heat]
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 pr-4"
    >
      <DrinkImage
        name={guess.drink.name}
        image={guess.drink.image}
        images={guess.drink.images}
        className="size-14 shrink-0 rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{guess.drink.name}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              heat.className
            )}
          >
            {heat.label}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${guess.closeness}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn("h-full rounded-full", heat.className)}
          />
        </div>
        <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>{guess.sameCategory ? "✓" : "✗"} categoría</span>
          <span>{guess.sameGlass ? "✓" : "✗"} vaso</span>
          {guess.sharedIngredients.length > 0 && (
            <span className="truncate">
              Comparte: {guess.sharedIngredients.join(", ")}
            </span>
          )}
        </p>
      </div>
      <span className="font-heading text-lg font-bold">{guess.closeness}</span>
    </motion.li>
  )
}

function Result({ game }: { game: CocktleGame }) {
  const copy = async () => {
    if (!game.share) return
    await navigator.clipboard.writeText(game.share)
    toast.success("Resultado copiado, sin spoilers 😉")
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-amber/40 bg-gradient-to-br from-amber/15 to-coral/10"
    >
      <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr]">
        {game.answer && (
          <Link to={`/bebida/${game.answer.id}`}>
            <DrinkImage
              name={game.answer.name}
              image={game.answer.image}
              images={game.answer.images}
              className="aspect-square w-full rounded-2xl"
            />
          </Link>
        )}
        <div>
          <p className="text-sm font-semibold text-highlight">
            {game.solved ? "¡Lo lograste!" : "Esta vez no fue…"}
          </p>
          <h2 className="mt-1 text-3xl font-bold">
            Era {game.answer?.name ?? "un misterio"}
          </h2>
          {game.share && (
            <pre className="mt-3 rounded-xl bg-background/60 p-3 font-sans text-sm whitespace-pre-wrap">
              {game.share}
            </pre>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={copy}>
              <Icon icon={Copy01Icon} className="size-4" /> Copiar resultado
            </Button>
            <p className="self-center text-sm text-muted-foreground">
              Nuevo reto mañana.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Stats({ mode }: { mode: CocktleMode }) {
  const stats = useCocktleStats(mode)
  if (!stats.data) return <Skeleton className="h-72 rounded-3xl" />
  const s = stats.data
  const max = Math.max(1, ...s.distribution)

  return (
    <aside className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold">Tus estadísticas</h2>
      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          ["Jugadas", s.played],
          ["% ganadas", s.winRate],
          ["Racha", s.currentStreak],
          ["Mejor", s.maxStreak],
        ].map(([label, value]) => (
          <div key={label}>
            <dd className="font-heading text-2xl font-bold">{value}</dd>
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>
      <h3 className="mt-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Intentos para ganar
      </h3>
      <ol className="mt-2 space-y-1.5">
        {s.distribution.map((count, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 font-heading font-bold">{i + 1}</span>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, (count / max) * 100)}%` }}
              className={cn(
                "rounded-md px-2 py-0.5 text-right text-xs font-bold",
                count ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {count}
            </motion.span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
