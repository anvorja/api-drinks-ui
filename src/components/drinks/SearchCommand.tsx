import { DrinkIcon, Leaf01Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { useNavigate } from "react-router"

import { Icon } from "@/components/common/Icon"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDrinkSuggestions } from "@/hooks/api/useDrinks"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

type SearchCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Global search (⌘K / Ctrl+K): typo-tolerant, jumps to a drink or filters by ingredient. */
export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate()
  const [text, setText] = useState("")
  const query = useDebouncedValue(text, 200)
  const { data = [], isFetching } = useDrinkSuggestions(query)

  const go = (to: string) => {
    onOpenChange(false)
    setText("")
    navigate(to)
  }

  const drinks = data.filter((s) => s.kind === "drink" && s.id)
  const ingredients = data.filter((s) => s.kind === "ingredient")

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar"
      description="Busca una bebida o un ingrediente"
      className="sm:max-w-lg"
    >
      {/* The API already ranks with typo tolerance: cmdk must not filter again. */}
      <Command shouldFilter={false}>
        <CommandInput
          value={text}
          onValueChange={setText}
          placeholder="Margarita, mojito, ron… (acepta errores)"
        />
        <CommandList className="max-h-96">
          {query.trim() === "" ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Escribe como te salga: <em>“margarta”</em> también funciona.
            </p>
          ) : (
            !isFetching && (
              <CommandEmpty>Nada por aquí. Prueba otro nombre.</CommandEmpty>
            )
          )}
          {drinks.length > 0 && (
            <CommandGroup heading="Bebidas">
              {drinks.map((s) => (
                <CommandItem
                  key={`d-${s.id}`}
                  value={`drink-${s.id}`}
                  onSelect={() => go(`/bebida/${s.id}`)}
                  className="gap-3"
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt=""
                      className="size-9 rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Icon icon={DrinkIcon} />
                  )}
                  <span className="font-medium">{s.value}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {ingredients.length > 0 && (
            <CommandGroup heading="Ingredientes">
              {ingredients.map((s) => (
                <CommandItem
                  key={`i-${s.value}`}
                  value={`ingredient-${s.value}`}
                  onSelect={() =>
                    go(`/explorar?ingredients=${encodeURIComponent(s.value)}`)
                  }
                  className="gap-3"
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt=""
                      className="size-9 rounded-lg bg-white/90 object-contain p-0.5"
                      loading="lazy"
                    />
                  ) : (
                    <Icon icon={Leaf01Icon} />
                  )}
                  <span>
                    Bebidas con <strong>{s.value}</strong>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
