import { CrownIcon, Delete02Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { useState, type FormEvent } from "react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { DrinkImage } from "@/components/drinks/DrinkImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem, VenueMenu } from "@/hooks/api/types"
import {
  useReplaceInventory,
  useVenueInventory,
  useVenueMenu,
} from "@/hooks/api/useVenues"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"
import { formatMoney } from "@/lib/format"

export default function VenuePage() {
  const { id = "" } = useParams()
  const menu = useVenueMenu(id)
  useDocumentTitle(menu.data?.venue.name ?? "Mi bar")

  if (menu.isPending) {
    return (
      <Page>
        <Skeleton className="h-96 rounded-3xl" />
      </Page>
    )
  }
  if (menu.isError) {
    return (
      <Page>
        <ErrorState error={menu.error} onRetry={() => menu.refetch()} />
      </Page>
    )
  }

  const m = menu.data
  return (
    <Page>
      <PageHeader
        eyebrow={`${m.venue.city} · costo objetivo ${Math.round(m.venue.targetPourCost * 100)} %`}
        title={m.venue.name}
        description="Tu carta se arma sola con lo que tienes en stock."
      />

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
        <Kpi label="Cocteles en carta" value={m.totals.onMenu} />
        <Kpi label="A un ingrediente" value={m.totals.almost} />
      </dl>

      {!m.pricing.included && (
        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-amber/40 bg-amber/10 p-5 sm:flex-row sm:items-center">
          <Icon icon={CrownIcon} className="size-8 text-highlight" />
          <p className="flex-1 text-sm">
            <strong>Costos, precios sugeridos y márgenes</strong> vienen con el
            plan Pro.
            {m.pricing.note && (
              <span className="text-muted-foreground"> {m.pricing.note}</span>
            )}
          </p>
          <Button asChild className="rounded-full">
            <Link to="/planes">Ver planes</Link>
          </Button>
        </div>
      )}

      <Tabs defaultValue="carta" className="mt-10">
        <TabsList className="h-11! rounded-full p-1">
          <TabsTrigger value="carta" className="rounded-full px-4">
            Carta
          </TabsTrigger>
          <TabsTrigger value="casi" className="rounded-full px-4">
            Te falta poco
          </TabsTrigger>
          <TabsTrigger value="inventario" className="rounded-full px-4">
            Inventario
          </TabsTrigger>
        </TabsList>
        <TabsContent value="carta" className="mt-6">
          <MenuTable menu={m} />
        </TabsContent>
        <TabsContent value="casi" className="mt-6">
          <Almost menu={m} />
        </TabsContent>
        <TabsContent value="inventario" className="mt-6">
          <Inventory venueId={id} currency={m.currency} />
        </TabsContent>
      </Tabs>
    </Page>
  )
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <dd className="font-heading text-4xl font-bold text-highlight">
        {value}
      </dd>
      <dt className="text-sm text-muted-foreground">{label}</dt>
    </div>
  )
}

/** Margin as a share of the price, to color it: the healthier, the greener. */
function marginTone(margin: number | null, price: number | null) {
  if (margin === null || !price) return "text-muted-foreground"
  const ratio = margin / price
  if (ratio >= 0.75) return "text-success"
  if (ratio >= 0.6) return "text-heat-warm"
  return "text-heat-cold"
}

function MenuTable({ menu }: { menu: VenueMenu }) {
  if (!menu.items.length) {
    return (
      <EmptyState
        emoji="🍸"
        title="Aún no hay cocteles en carta"
        description="Agrega ingredientes en stock en la pestaña Inventario."
      />
    )
  }
  const money = (n: number | null) =>
    n === null ? "—" : formatMoney(n, menu.currency)

  return (
    <>
      {/* Phones: one card per drink. */}
      <ul className="grid gap-3 md:hidden">
        {menu.items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <DrinkImage
              name={item.name}
              image={item.image}
              className="size-16 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <Link to={`/bebida/${item.id}`} className="font-semibold">
                {item.name}
              </Link>
              {menu.pricing.included && (
                <dl className="mt-1 grid grid-cols-3 gap-1 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Costo</dt>
                    <dd>{money(item.cost)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Precio</dt>
                    <dd className="font-semibold">
                      {money(item.suggestedPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Margen</dt>
                    <dd
                      className={cn(
                        "font-semibold",
                        marginTone(item.margin, item.suggestedPrice)
                      )}
                    >
                      {money(item.margin)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Tablets and up: the full table. */}
      <div className="hidden overflow-hidden rounded-3xl border border-border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Carta del bar con costo, precio sugerido y margen
          </caption>
          <thead className="bg-muted/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Coctel
              </th>
              {menu.pricing.included && (
                <>
                  <th scope="col" className="px-4 py-3 text-right">
                    Costo
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Precio sugerido
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Margen
                  </th>
                </>
              )}
              <th scope="col" className="px-4 py-3">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {menu.items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    to={`/bebida/${item.id}`}
                    className="flex items-center gap-3 font-semibold"
                  >
                    <DrinkImage
                      name={item.name}
                      image={item.image}
                      className="size-10 rounded-lg"
                    />
                    {item.name}
                  </Link>
                </td>
                {menu.pricing.included && (
                  <>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {money(item.cost)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {money(item.suggestedPrice)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold tabular-nums",
                        marginTone(item.margin, item.suggestedPrice)
                      )}
                    >
                      {money(item.margin)}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {item.unpriced.length > 0 &&
                    `Sin precio: ${item.unpriced.join(", ")}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Almost({ menu }: { menu: VenueMenu }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h2 className="text-xl font-bold">Qué comprar</h2>
        <p className="text-sm text-muted-foreground">
          Cada compra desbloquea cocteles nuevos.
        </p>
        <ul className="mt-4 space-y-2">
          {menu.shoppingTips.map((tip) => (
            <li
              key={tip.buy}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="font-semibold">
                🛒 {tip.buy}{" "}
                <span className="text-highlight">+{tip.unlocks} cocteles</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tip.drinks.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-bold">Te falta poco</h2>
        <p className="text-sm text-muted-foreground">
          Cocteles a un ingrediente de tu carta.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {menu.almost.map((drink) => (
            <li key={drink.id}>
              <Link to={`/bebida/${drink.id}`} className="block">
                <DrinkImage
                  name={drink.name}
                  image={drink.image}
                  className="aspect-square w-full rounded-2xl"
                />
                <p className="mt-2 font-medium">{drink.name}</p>
                <p className="text-xs text-muted-foreground">
                  Falta: {drink.missing.join(", ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Inventory({
  venueId,
  currency,
}: {
  venueId: string
  currency: string
}) {
  const inventory = useVenueInventory(venueId)
  const replace = useReplaceInventory(venueId)
  const [newItem, setNewItem] = useState({
    ingredient: "",
    bottleSizeMl: "",
    bottleCost: "",
    costPerServing: "",
  })

  if (inventory.isPending) return <Skeleton className="h-64 rounded-3xl" />
  if (inventory.isError) return <ErrorState error={inventory.error} />
  const items = inventory.data.items

  const save = (next: InventoryItem[], message: string) =>
    replace.mutate(next, {
      onSuccess: () => toast.success(message),
      onError: (error) => toast.error(errorMessage(error)),
    })

  const num = (value: string) => (value.trim() === "" ? null : Number(value))

  const onAdd = (event: FormEvent) => {
    event.preventDefault()
    save(
      [
        ...items,
        {
          ingredient: newItem.ingredient.trim(),
          bottleSizeMl: num(newItem.bottleSizeMl),
          bottleCost: num(newItem.bottleCost),
          costPerServing: num(newItem.costPerServing),
          inStock: true,
        },
      ],
      `${newItem.ingredient} agregado. La carta se recalculó.`
    )
    setNewItem({
      ingredient: "",
      bottleSizeMl: "",
      bottleCost: "",
      costPerServing: "",
    })
  }

  const money = (n: number | null) =>
    n === null ? "—" : formatMoney(n, currency)

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {items.map((item) => (
          <li
            key={item.ingredient}
            className="flex items-center gap-4 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.ingredient}</p>
              <p className="text-xs text-muted-foreground">
                {item.bottleSizeMl
                  ? `${item.bottleSizeMl} ml · ${money(item.bottleCost)}`
                  : `${money(item.costPerServing)} por porción`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              En stock
              <Switch
                checked={item.inStock}
                disabled={replace.isPending}
                onCheckedChange={(inStock) =>
                  save(
                    items.map((i) =>
                      i.ingredient === item.ingredient ? { ...i, inStock } : i
                    ),
                    inStock
                      ? `${item.ingredient} de vuelta en stock`
                      : `${item.ingredient} agotado`
                  )
                }
              />
            </label>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Quitar ${item.ingredient}`}
              disabled={replace.isPending}
              onClick={() =>
                save(
                  items.filter((i) => i.ingredient !== item.ingredient),
                  `${item.ingredient} quitado`
                )
              }
            >
              <Icon icon={Delete02Icon} className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onAdd}
        className="rounded-3xl border border-dashed border-border p-5"
      >
        <h3 className="font-semibold">Agregar ingrediente</h3>
        <p className="text-xs text-muted-foreground">
          Botellas: tamaño y costo. Decoraciones (sal, hierbabuena…): costo por
          porción.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input
            aria-label="Ingrediente"
            placeholder="Ingrediente (ej. Gin)"
            required
            value={newItem.ingredient}
            onChange={(e) =>
              setNewItem({ ...newItem, ingredient: e.target.value })
            }
            className="h-10 rounded-xl"
          />
          <Input
            aria-label="Tamaño en ml"
            placeholder="ml"
            type="number"
            min={1}
            value={newItem.bottleSizeMl}
            onChange={(e) =>
              setNewItem({ ...newItem, bottleSizeMl: e.target.value })
            }
            className="h-10 rounded-xl"
          />
          <Input
            aria-label="Costo de la botella"
            placeholder="Costo botella"
            type="number"
            min={0}
            value={newItem.bottleCost}
            onChange={(e) =>
              setNewItem({ ...newItem, bottleCost: e.target.value })
            }
            className="h-10 rounded-xl"
          />
          <Input
            aria-label="Costo por porción"
            placeholder="Por porción"
            type="number"
            min={0}
            value={newItem.costPerServing}
            onChange={(e) =>
              setNewItem({ ...newItem, costPerServing: e.target.value })
            }
            className="h-10 rounded-xl"
          />
          <Button
            type="submit"
            className="h-10 rounded-xl"
            disabled={replace.isPending || !newItem.ingredient.trim()}
          >
            Agregar
          </Button>
        </div>
      </form>
    </div>
  )
}
