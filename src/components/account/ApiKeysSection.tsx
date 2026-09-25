import {
  Alert02Icon,
  Copy01Icon,
  Delete02Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons"
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { config } from "@/config/env"
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/hooks/api/useApiKeys"
import { errorMessage, isApiError } from "@/lib/api/errors"
import type { components } from "@/lib/api/schema"
import { formatDate, formatDateTime } from "@/lib/format"

type ApiKey = components["schemas"]["ApiKey"]
type CreatedApiKey = components["schemas"]["CreatedApiKey"]

/** Anchor used by the post-payment "Crear mi llave de API" button (/cuenta#api). */
export const API_SECTION_ID = "api"

/** Where integrations send their requests: the public API URL, or this origin behind the proxy. */
const publicApiUrl = () => config.apiUrl || window.location.origin

export function ApiKeysSection() {
  const keys = useApiKeys()
  const [created, setCreated] = useState<CreatedApiKey | null>(null)
  const ref = useRef<HTMLElement>(null)

  // Arriving from /cuenta#api (after paying): bring the section into view.
  useEffect(() => {
    if (window.location.hash === `#${API_SECTION_ID}`) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [keys.isSuccess])

  const active = keys.data?.keys.filter((k) => !k.revokedAt) ?? []
  const revoked = keys.data?.keys.filter((k) => k.revokedAt) ?? []
  const quota = keys.data?.quota

  return (
    <section
      id={API_SECTION_ID}
      ref={ref}
      aria-labelledby="api-titulo"
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="api-titulo"
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <Icon icon={Key01Icon} className="size-6 text-highlight" />
            API para tus integraciones
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Consulta el catálogo desde tu propia app, bot o sistema de punto de
            venta. Envía la llave en la cabecera{" "}
            <code className="rounded bg-muted px-1">X-API-Key</code>.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 rounded-full">
          <Link to="/planes">Más llaves y peticiones</Link>
        </Button>
      </div>

      {keys.isPending ? (
        <Skeleton className="mt-6 h-40 rounded-2xl" />
      ) : keys.isError ? (
        <p className="mt-6 text-sm text-destructive">
          {errorMessage(keys.error)}
        </p>
      ) : (
        <>
          {quota && (
            <div className="mt-6 rounded-2xl bg-muted/60 p-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">Peticiones de hoy</span>
                <span className="tabular-nums">
                  <strong>{quota.used.toLocaleString("es-CO")}</strong> de{" "}
                  {quota.limit.toLocaleString("es-CO")}
                </span>
              </div>
              <Progress
                value={
                  quota.limit
                    ? Math.min(100, (quota.used / quota.limit) * 100)
                    : 0
                }
                className="mt-2"
                aria-label="Peticiones usadas hoy"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Se reinicia en {Math.ceil(quota.resetsInSeconds / 3600)} h (día
                UTC). Cuenta para todas tus llaves.
              </p>
            </div>
          )}

          {created && (
            <NewKeySecret created={created} onDone={() => setCreated(null)} />
          )}

          <CreateKeyForm onCreated={setCreated} />

          {active.length > 0 ? (
            <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {active.map((key) => (
                <KeyRow key={key.id} apiKey={key} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Aún no tienes llaves activas.
            </p>
          )}
          {revoked.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {revoked.length}{" "}
              {revoked.length === 1 ? "llave revocada" : "llaves revocadas"} (ya
              no funcionan).
            </p>
          )}
        </>
      )}
    </section>
  )
}

function CreateKeyForm({
  onCreated,
}: {
  onCreated: (key: CreatedApiKey) => void
}) {
  const create = useCreateApiKey()
  const [name, setName] = useState("")

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    create.mutate(name.trim(), {
      onSuccess: (key) => {
        setName("")
        onCreated(key)
      },
    })
  }

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <label htmlFor="api-key-name" className="text-sm font-medium">
        Nueva llave
      </label>
      <div className="mt-2 flex gap-2">
        <Input
          id="api-key-name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="Para reconocerla: Bot de Telegram, POS…"
          className="h-11 rounded-full bg-background/50 px-4"
        />
        <Button
          type="submit"
          size="lg"
          className="h-11 rounded-full"
          disabled={!name.trim() || create.isPending}
        >
          Crear llave
        </Button>
      </div>
      {create.isError &&
        (isApiError(create.error, "PLAN_LIMIT") ? (
          <p className="mt-2 text-sm text-destructive">
            Llegaste al máximo de llaves de tu plan.{" "}
            <Link
              to="/planes"
              className="font-medium underline underline-offset-4"
            >
              Mejora tu plan
            </Link>{" "}
            o revoca una que no uses.
          </p>
        ) : (
          <p className="mt-2 text-sm text-destructive">
            {errorMessage(create.error)}
          </p>
        ))}
    </form>
  )
}

/** The secret, shown once. It lives only in this component's state, never in the query cache. */
function NewKeySecret({
  created,
  onDone,
}: {
  created: CreatedApiKey
  onDone: () => void
}) {
  const example = `curl -H "X-API-Key: ${created.key}" "${publicApiUrl()}/v1/drinks?q=mojito"`

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copiado`)
  }

  return (
    <div
      role="status"
      className="mt-6 rounded-2xl border border-amber/50 bg-amber/10 p-4"
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icon icon={Alert02Icon} className="size-5 text-highlight" />
        Guarda tu llave “{created.name}” ahora: no la volveremos a mostrar.
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-background/70 py-1 pr-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-sm">
          {created.key}
        </code>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-lg"
          onClick={() => copy(created.key, "Llave")}
        >
          <Icon icon={Copy01Icon} className="size-4" /> Copiar
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Pruébala:</p>
      <div className="mt-1 flex items-center gap-2 rounded-xl bg-background/70 py-1 pr-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-xs">
          {example}
        </code>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-lg"
          onClick={() => copy(example, "Ejemplo")}
        >
          <Icon icon={Copy01Icon} className="size-4" />
        </Button>
      </div>
      <Button className="mt-4 rounded-full" onClick={onDone}>
        Ya la guardé
      </Button>
    </div>
  )
}

function KeyRow({ apiKey }: { apiKey: ApiKey }) {
  const revoke = useRevokeApiKey()
  const [open, setOpen] = useState(false)

  const onRevoke = () =>
    revoke.mutate(apiKey.id, {
      onSuccess: () => {
        setOpen(false)
        toast.success(`Llave “${apiKey.name}” revocada`)
      },
      onError: (error) => toast.error(errorMessage(error)),
    })

  return (
    <li className="flex items-center gap-4 bg-background/40 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{apiKey.name}</p>
        <p className="text-xs text-muted-foreground">
          <code className="font-mono">{apiKey.prefix}…</code> · creada el{" "}
          {formatDate(apiKey.createdAt)} ·{" "}
          {apiKey.lastUsedAt
            ? `último uso ${formatDateTime(apiKey.lastUsedAt)}`
            : "sin usar"}
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Revocar ${apiKey.name}`}
          onClick={() => setOpen(true)}
        >
          <Icon icon={Delete02Icon} className="size-4" />
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Revocar “{apiKey.name}”?</DialogTitle>
            <DialogDescription>
              Las integraciones que la usan dejarán de funcionar de inmediato.
              No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="rounded-full"
              disabled={revoke.isPending}
              onClick={onRevoke}
            >
              Revocar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
