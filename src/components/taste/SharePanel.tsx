import {
  Copy01Icon,
  Download04Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { apiAsset } from "@/config/env"
import {
  useShareTaste,
  useStopSharingTaste,
  useTasteShare,
} from "@/hooks/api/useTaste"
import { useAuth } from "@/hooks/useAuth"
import { errorMessage } from "@/lib/api/errors"

/** Public link + the 1200×630 card the API renders, ready for social networks. */
export function SharePanel() {
  const { user } = useAuth()
  const share = useTasteShare()
  const create = useShareTaste()
  const stop = useStopSharingTaste()
  const [name, setName] = useState(user?.name.split(" ")[0] ?? "")

  if (share.isPending) return <Skeleton className="h-72 rounded-3xl" />
  const current = share.data?.share

  if (!current) {
    const onSubmit = (event: FormEvent) => {
      event.preventDefault()
      create.mutate(name.trim(), {
        onSuccess: () => toast.success("Tu ADN ya tiene enlace público ✨"),
        onError: (error) => toast.error(errorMessage(error)),
      })
    }
    return (
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-dashed border-amber/50 bg-amber/5 p-6"
      >
        <h3 className="text-xl font-bold">Comparte tu ADN</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Creamos un enlace público y una tarjeta para redes. Solo se ve el
          nombre que elijas, nunca tu correo.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            aria-label="Nombre público"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-full bg-card px-4"
            placeholder="¿Cómo te mostramos?"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-full"
            disabled={!name.trim() || create.isPending}
          >
            Crear enlace
          </Button>
        </div>
      </form>
    )
  }

  const publicUrl = `${window.location.origin}/adn/${current.slug}`
  const cardUrl = apiAsset(current.links.cardPng)

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl)
    toast.success("Enlace copiado")
  }
  const nativeShare = async () => {
    try {
      await navigator.share({
        title: `El ADN de sabor de ${current.displayName}`,
        text: "¿Qué tan compatibles somos? 🍹",
        url: publicUrl,
      })
    } catch {
      // Share sheet closed.
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <h3 className="text-xl font-bold">Tu tarjeta</h3>
      <img
        src={cardUrl}
        alt={`Tarjeta del ADN de sabor de ${current.displayName}`}
        width={1200}
        height={630}
        className="aspect-[1200/630] w-full rounded-2xl bg-muted object-cover ring-1 ring-border"
      />
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/50 py-1 pr-1 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-xs">
          {publicUrl}
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full"
          onClick={copy}
        >
          <Icon icon={Copy01Icon} className="size-4" /> Copiar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {"share" in navigator && (
          <Button className="rounded-full" onClick={nativeShare}>
            <Icon icon={Share08Icon} className="size-4" /> Compartir
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <a
            href={cardUrl}
            download={`adn-${current.slug}.png`}
            target="_blank"
            rel="noreferrer"
          >
            <Icon icon={Download04Icon} className="size-4" /> Descargar PNG
          </a>
        </Button>
        <Button
          variant="ghost"
          className="ml-auto rounded-full text-muted-foreground"
          disabled={stop.isPending}
          onClick={() =>
            stop.mutate(undefined, {
              onSuccess: () => toast.success("Tu enlace dejó de ser público"),
            })
          }
        >
          Dejar de compartir
        </Button>
      </div>
    </div>
  )
}
