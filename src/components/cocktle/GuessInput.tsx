import { useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDrinkSuggestions } from "@/hooks/api/useDrinks"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

type GuessInputProps = {
  disabled?: boolean
  /** Drinks already tried, hidden from the list. */
  exclude: string[]
  onGuess: (drinkId: string, name: string) => void
}

/** Pick a drink by name (typos welcome). */
export function GuessInput({ disabled, exclude, onGuess }: GuessInputProps) {
  const [text, setText] = useState("")
  const query = useDebouncedValue(text, 150)
  const { data = [] } = useDrinkSuggestions(query, 8)
  const options = data.filter(
    (s) => s.kind === "drink" && s.id && !exclude.includes(s.id)
  )

  return (
    <Command
      shouldFilter={false}
      className="rounded-3xl border border-border bg-card p-1.5 shadow-lg"
    >
      <CommandInput
        value={text}
        onValueChange={setText}
        disabled={disabled}
        placeholder="Escribe tu apuesta: mojito, negroni…"
        className="h-10 text-base"
      />
      {text.trim() && (
        <CommandList className="max-h-64">
          <CommandEmpty>Ninguna bebida con ese nombre.</CommandEmpty>
          {options.map((s) => (
            <CommandItem
              key={s.id}
              value={s.id ?? s.value}
              onSelect={() => {
                if (!s.id) return
                onGuess(s.id, s.value)
                setText("")
              }}
              className="gap-3 py-2"
            >
              {s.image && (
                <img
                  src={s.image}
                  alt=""
                  className="size-9 rounded-lg object-cover"
                />
              )}
              <span className="font-medium">{s.value}</span>
            </CommandItem>
          ))}
        </CommandList>
      )}
    </Command>
  )
}
