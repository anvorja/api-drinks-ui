import { cn } from "cn"
import { motion } from "motion/react"
import { Link } from "react-router"

import { Skeleton } from "@/components/ui/skeleton"
import type { DrinkCard as DrinkCardData } from "@/hooks/api/types"
import { DrinkImage } from "./DrinkImage"

type DrinkCardProps = {
  drink: DrinkCardData
  className?: string
  priority?: boolean
}

export function DrinkCard({ drink, className, priority }: DrinkCardProps) {
  const ingredients = drink.ingredients
    .slice(0, 3)
    .map((i) => i.nameEs ?? i.name)
    .join(" · ")

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("group relative", className)}
    >
      <Link
        to={`/bebida/${drink.id}`}
        className="block overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px] hover:shadow-coral/40 hover:ring-amber/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden">
          <DrinkImage
            name={drink.name}
            image={drink.image}
            images={drink.images}
            priority={priority}
            className="size-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
              drink.alcoholic
                ? "bg-black/40 text-white"
                : "bg-success/90 text-night"
            )}
          >
            {drink.alcoholic ? "Con alcohol" : "Sin alcohol"}
          </span>
          <h3 className="absolute right-3 bottom-3 left-3 font-heading text-lg leading-tight font-bold text-balance text-white">
            {drink.name}
          </h3>
        </div>
        <div className="space-y-1 px-4 py-3">
          <p className="text-xs font-medium text-highlight">
            {drink.categoryEs ?? drink.category ?? "Bebida"}
          </p>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {ingredients}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}

export function DrinkCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl ring-1 ring-border">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 px-4 py-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function DrinkGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  )
}
