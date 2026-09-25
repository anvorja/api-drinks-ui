import { motion } from "motion/react"
import { Link } from "react-router"

import { ErrorState } from "@/components/common/States"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { Skeleton } from "@/components/ui/skeleton"
import { useTasteCompatibility } from "@/hooks/api/useTaste"
import { FLAVOR_LABEL } from "@/lib/flavors"
import { DnaRadar } from "./DnaRadar"

export function CompatibilityResult({ slug }: { slug: string }) {
  const compatibility = useTasteCompatibility(slug)

  if (compatibility.isPending) return <Skeleton className="h-80 rounded-3xl" />
  if (compatibility.isError) return <ErrorState error={compatibility.error} />
  const c = compatibility.data

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border border-border bg-card p-6"
    >
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div>
          <p className="text-gradient font-heading text-7xl font-bold">
            {c.score}
            <span className="text-4xl"> %</span>
          </p>
          <p className="mt-2 text-lg font-semibold text-balance">
            {c.headline.replace(/^\d+\s*%\s*compatibles\s*·\s*/i, "")}
          </p>
          <div className="mt-4 space-y-2 text-sm">
            {c.sharedTraits.length > 0 && (
              <p>
                <span className="text-muted-foreground">Comparten: </span>
                {c.sharedTraits.map((t) => FLAVOR_LABEL[t]).join(", ")}
              </p>
            )}
            {c.onlyYou.length > 0 && (
              <p>
                <span className="text-muted-foreground">Solo tú: </span>
                {c.onlyYou.map((t) => FLAVOR_LABEL[t]).join(", ")}
              </p>
            )}
            {c.onlyThem.length > 0 && (
              <p>
                <span className="text-muted-foreground">
                  Solo {c.them.displayName}:{" "}
                </span>
                {c.onlyThem.map((t) => FLAVOR_LABEL[t]).join(", ")}
              </p>
            )}
          </div>
        </div>
        <DnaRadar
          series={[
            { profile: c.you.profile, label: "Tú" },
            {
              profile: c.them.taste.profile,
              label: c.them.displayName,
              tone: "secondary",
            },
          ]}
          size={300}
          className="mx-auto max-w-xs"
        />
      </div>

      {c.bridges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold">Cocteles puente</h3>
          <p className="text-sm text-muted-foreground">
            Ninguno de los dos los ha probado y a ambos les gustarían.
          </p>
          <ul className="-mx-6 mt-3 flex scrollbar-none gap-3 overflow-x-auto px-6 pb-1">
            {c.bridges.map((drink) => (
              <li key={drink.id} className="w-40 shrink-0">
                <Link to={`/bebida/${drink.id}`} className="group block">
                  <DrinkImage
                    name={drink.name}
                    image={drink.image}
                    images={drink.images}
                    className="aspect-square w-full rounded-2xl"
                  />
                  <p className="mt-2 line-clamp-1 font-medium">{drink.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tú {drink.forYou} % · {c.them.displayName} {drink.forThem} %
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
