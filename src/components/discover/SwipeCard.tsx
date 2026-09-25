import { cn } from "cn"
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react"
import { forwardRef, useImperativeHandle } from "react"

import { DrinkImage } from "@/components/drinks/DrinkImage"
import type { DrinkCard, Reaction } from "@/hooks/api/types"

const THRESHOLD = 110

export type SwipeCardHandle = { swipe: (reaction: Reaction) => Promise<void> }

type SwipeCardProps = {
  drink: DrinkCard
  /** 0 is the card on top; the rest peek from behind. */
  depth: number
  onSwiped: (reaction: Reaction) => void
}

const EXIT: Record<Reaction, { x: number; y: number }> = {
  like: { x: 700, y: 40 },
  dislike: { x: -700, y: 40 },
  superlike: { x: 0, y: -900 },
}

/** A drink you can drag right (like), left (dislike) or up (superlike). */
export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ drink, depth, onSwiped }, ref) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-300, 300], [-18, 18])
    const likeOpacity = useTransform(x, [20, THRESHOLD], [0, 1])
    const nopeOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0])
    const superOpacity = useTransform(y, [-THRESHOLD, -30], [1, 0])

    const swipe = async (reaction: Reaction) => {
      const target = EXIT[reaction]
      await Promise.all([
        animate(x, target.x, { duration: 0.35, ease: "easeIn" }),
        animate(y, target.y, { duration: 0.35, ease: "easeIn" }),
      ])
      onSwiped(reaction)
    }

    useImperativeHandle(ref, () => ({ swipe }))

    const onDragEnd = (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info
      if (offset.y < -THRESHOLD && Math.abs(offset.x) < THRESHOLD) {
        void swipe("superlike")
      } else if (offset.x > THRESHOLD || velocity.x > 800) {
        void swipe("like")
      } else if (offset.x < -THRESHOLD || velocity.x < -800) {
        void swipe("dislike")
      } else {
        void animate(x, 0, { type: "spring", stiffness: 400, damping: 30 })
        void animate(y, 0, { type: "spring", stiffness: 400, damping: 30 })
      }
    }

    const top = depth === 0
    const ingredients = drink.ingredients
      .map((i) => i.nameEs ?? i.name)
      .slice(0, 4)
      .join(" · ")

    // The outer layer places the card in the stack; the inner one follows the finger.
    return (
      <motion.div
        className={cn("absolute inset-0", !top && "pointer-events-none")}
        style={{ zIndex: 10 - depth }}
        initial={false}
        animate={{
          scale: 1 - depth * 0.05,
          y: depth * 16,
          opacity: depth > 2 ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.article
          aria-hidden={!top}
          aria-label={top ? drink.name : undefined}
          className={cn(
            "absolute inset-0 overflow-hidden rounded-[2rem] bg-card shadow-2xl ring-1 shadow-black/30 ring-white/10 select-none",
            top && "cursor-grab touch-none active:cursor-grabbing"
          )}
          style={{ x, y, rotate }}
          drag={top}
          dragElastic={0.9}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={onDragEnd}
        >
          <DrinkImage
            name={drink.name}
            image={drink.image}
            images={drink.images}
            priority={depth < 2}
            sizes="(min-width: 640px) 420px, 90vw"
            className="pointer-events-none size-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />

          <Stamp
            style={{ opacity: likeOpacity }}
            className="top-10 left-6 -rotate-12 border-success text-success"
          >
            Me provoca
          </Stamp>
          <Stamp
            style={{ opacity: nopeOpacity }}
            className="top-10 right-6 rotate-12 border-heat-cold text-heat-cold"
          >
            Paso
          </Stamp>
          <Stamp
            style={{ opacity: superOpacity }}
            className="bottom-40 left-1/2 -translate-x-1/2 border-amber text-amber"
          >
            ¡Súper!
          </Stamp>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-sm font-medium text-amber">
              {drink.categoryEs ?? drink.category}
              {drink.glassEs ? ` · ${drink.glassEs}` : ""}
            </p>
            <h2 className="mt-1 text-4xl leading-none font-bold text-balance">
              {drink.name}
            </h2>
            <p className="mt-3 line-clamp-2 text-sm text-white/80">
              {ingredients}
            </p>
          </div>
        </motion.article>
      </motion.div>
    )
  }
)

function Stamp({
  className,
  style,
  children,
}: {
  className: string
  style: React.ComponentProps<typeof motion.span>["style"]
  children: React.ReactNode
}) {
  return (
    <motion.span
      aria-hidden="true"
      style={style}
      className={cn(
        "pointer-events-none absolute rounded-xl border-4 bg-black/20 px-3 py-1 font-heading text-2xl font-bold tracking-wider uppercase backdrop-blur-sm",
        className
      )}
    >
      {children}
    </motion.span>
  )
}
