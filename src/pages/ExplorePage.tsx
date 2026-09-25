import {
  Cancel01Icon,
  FilterHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"

import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import {
  DrinkCard,
  DrinkCardSkeleton,
  DrinkGrid,
} from "@/components/drinks/DrinkCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { DrinkFacets } from "@/hooks/api/types"
import {
  useDrinkFacets,
  useDrinkSearch,
  type DrinkFilters,
} from "@/hooks/api/useDrinks"
import { useAuth } from "@/hooks/useAuth"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { useInView } from "@/hooks/useInView"
import {
  activeFilterCount,
  filtersFromParams,
  paramsFromFilters,
} from "@/lib/drinkFilters"

const ANY = "__any"

export default function ExplorePage() {
  useDocumentTitle("Explorar")
  const [params, setParams] = useSearchParams()
  const filters = filtersFromParams(params)
  const facets = useDrinkFacets()

  const update = (patch: Partial<DrinkFilters>) =>
    setParams(paramsFromFilters({ ...filters, ...patch }), { replace: true })

  const count = activeFilterCount(filters)

  return (
    <Page>
      <PageHeader
        eyebrow="La carta completa"
        title="Explorar"
        description="Filtra por ingrediente, vaso o categoría. Combina todo lo que quieras."
      />

      <div className="mt-8 flex gap-2">
        <SearchBox value={filters.q ?? ""} onChange={(q) => update({ q })} />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-4 lg:hidden"
            >
              <Icon icon={FilterHorizontalIcon} className="size-4" />
              Filtros
              {count > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85svh] overflow-y-auto rounded-t-3xl"
          >
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Se aplican al instante.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8">
              <Filters
                filters={filters}
                facets={facets.data}
                onChange={update}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-24">
            <Filters filters={filters} facets={facets.data} onChange={update} />
          </div>
        </aside>
        <Results
          filters={filters}
          onClear={() => setParams(new URLSearchParams(), { replace: true })}
        />
      </div>
    </Page>
  )
}

function SearchBox({
  value,
  onChange,
}: {
  value: string
  onChange: (q: string | undefined) => void
}) {
  const [text, setText] = useState(value)
  const debounced = useDebouncedValue(text, 300)

  // Keep the box in sync when the URL changes elsewhere (back button, "clear").
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => {
    if (debounced.trim() !== value) onChange(debounced.trim() || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the typed text settles
  }, [debounced])

  return (
    <label className="relative flex-1">
      <span className="sr-only">Buscar por nombre</span>
      <Icon
        icon={Search01Icon}
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Busca por nombre: daiquiri, mojito…"
        className="h-12 rounded-full bg-card pl-12 text-base ring-1 ring-border"
      />
    </label>
  )
}

function Filters({
  filters,
  facets,
  onChange,
}: {
  filters: DrinkFilters
  facets?: DrinkFacets
  onChange: (patch: Partial<DrinkFilters>) => void
}) {
  const { isAdult } = useAuth()
  const selected = filters.ingredients ?? []
  const toggleIngredient = (value: string) =>
    onChange({
      ingredients: selected.includes(value)
        ? selected.filter((i) => i !== value)
        : [...selected, value],
    })

  return (
    <div className="space-y-7">
      <FilterGroup label="Alcohol">
        <Segmented
          value={filters.alcoholic ?? ANY}
          onChange={(v) =>
            onChange({
              alcoholic: v === ANY ? undefined : (v as "true" | "false"),
            })
          }
          options={[
            { value: ANY, label: "Todas" },
            { value: "true", label: "Con", disabled: !isAdult },
            { value: "false", label: "Sin" },
          ]}
        />
        {!isAdult && (
          <p className="mt-2 text-xs text-muted-foreground">
            Las bebidas con alcohol aparecen al entrar con una cuenta mayor de
            edad.
          </p>
        )}
      </FilterGroup>

      <FilterGroup label="Clásicos IBA">
        <Segmented
          value={filters.iba ?? ANY}
          onChange={(v) =>
            onChange({ iba: v === ANY ? undefined : (v as "true" | "false") })
          }
          options={[
            { value: ANY, label: "Todos" },
            { value: "true", label: "Solo IBA" },
          ]}
        />
      </FilterGroup>

      <FilterGroup label="Categoría">
        <FacetSelect
          value={filters.category}
          values={facets?.categories}
          placeholder="Cualquier categoría"
          onChange={(category) => onChange({ category })}
        />
      </FilterGroup>

      <FilterGroup label="Vaso">
        <FacetSelect
          value={filters.glass}
          values={facets?.glasses}
          placeholder="Cualquier vaso"
          onChange={(glass) => onChange({ glass })}
        />
      </FilterGroup>

      <FilterGroup label="Ingredientes (todos a la vez)">
        <ul className="flex flex-wrap gap-1.5">
          {selected
            .filter((s) => !facets?.ingredients.some((f) => f.value === s))
            .map((value) => (
              <li key={value}>
                <Chip active onClick={() => toggleIngredient(value)}>
                  {value}
                </Chip>
              </li>
            ))}
          {facets?.ingredients.slice(0, 24).map((facet) => (
            <li key={facet.value}>
              <Chip
                active={selected.includes(facet.value)}
                onClick={() => toggleIngredient(facet.value)}
              >
                {facet.valueEs ?? facet.value}
                <span className="opacity-50">{facet.count}</span>
              </Chip>
            </li>
          ))}
        </ul>
      </FilterGroup>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </legend>
      {children}
    </fieldset>
  )
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string; disabled?: boolean }[]
  onChange: (value: string) => void
}) {
  return (
    <div role="radiogroup" className="inline-flex rounded-full bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all disabled:cursor-not-allowed disabled:opacity-40",
            value === option.value &&
              "bg-background text-foreground shadow-sm dark:bg-secondary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function FacetSelect({
  value,
  values,
  placeholder,
  onChange,
}: {
  value?: string
  values?: DrinkFacets["categories"]
  placeholder: string
  onChange: (value: string | undefined) => void
}) {
  return (
    <Select
      value={value ?? ANY}
      onValueChange={(v) => onChange(v === ANY ? undefined : v)}
    >
      <SelectTrigger className="w-full rounded-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{placeholder}</SelectItem>
        {values?.map((facet) => (
          <SelectItem key={facet.value} value={facet.value}>
            {facet.valueEs ?? facet.value} ({facet.count})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
        active
          ? "border-transparent bg-primary font-medium text-primary-foreground"
          : "border-border hover:border-amber/60"
      )}
    >
      {children}
      {active && <Icon icon={Cancel01Icon} className="size-3.5" />}
    </button>
  )
}

function Results({
  filters,
  onClear,
}: {
  filters: DrinkFilters
  onClear: () => void
}) {
  const search = useDrinkSearch(filters)
  const [sentinel, inView] = useInView<HTMLDivElement>()
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = search

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (search.isError && !search.data) {
    return <ErrorState error={search.error} onRetry={() => search.refetch()} />
  }

  const items = search.data?.pages.flatMap((page) => page.items) ?? []
  const total = search.data?.pages[0]?.total

  return (
    <section aria-live="polite" aria-busy={search.isFetching}>
      <p className="mb-4 text-sm text-muted-foreground">
        {total === undefined ? (
          "Buscando…"
        ) : (
          <>
            <strong className="text-foreground">{total}</strong>{" "}
            {total === 1 ? "bebida" : "bebidas"}
          </>
        )}
      </p>

      {search.isPending ? (
        <DrinkGrid className="xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <DrinkCardSkeleton key={i} />
          ))}
        </DrinkGrid>
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🍸"
          title="Ninguna bebida con todo eso"
          description="Quita algún filtro o prueba con otro ingrediente."
          action={
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onClear}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <DrinkGrid
          className={cn(
            "transition-opacity xl:grid-cols-4",
            search.isPlaceholderData && "opacity-60"
          )}
        >
          {items.map((drink, i) => (
            <DrinkCard key={drink.id} drink={drink} priority={i < 4} />
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 4 }, (_, i) => (
              <DrinkCardSkeleton key={`s${i}`} />
            ))}
        </DrinkGrid>
      )}

      <div ref={sentinel} className="h-px" />
      {hasNextPage && !isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => fetchNextPage()}
          >
            Cargar más
          </Button>
        </div>
      )}
    </section>
  )
}
