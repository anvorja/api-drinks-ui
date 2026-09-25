import { Logout01Icon } from "@hugeicons/core-free-icons"
import { useMutation } from "@tanstack/react-query"
import { cn } from "cn"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { ApiKeysSection } from "@/components/account/ApiKeysSection"
import { FormField } from "@/components/auth/FormField"
import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/States"
import { DrinkCard, DrinkGrid } from "@/components/drinks/DrinkCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Payment } from "@/hooks/api/types"
import {
  useCancelSubscription,
  useMySubscription,
  usePayments,
} from "@/hooks/api/useBilling"
import { useFavorites } from "@/hooks/api/useFavorites"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { api } from "@/lib/api/client"
import { call, errorMessage } from "@/lib/api/errors"
import { sessionStore } from "@/lib/auth/session"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"
import { ROLE_LABEL } from "@/lib/roles"

const PAYMENT_STATUS: Record<
  Payment["status"],
  { label: string; className: string }
> = {
  approved: { label: "Aprobado", className: "bg-success/15 text-success" },
  pending: { label: "Pendiente", className: "bg-heat-hot/20 text-highlight" },
  declined: {
    label: "Rechazado",
    className: "bg-destructive/15 text-destructive",
  },
  voided: { label: "Anulado", className: "bg-muted text-muted-foreground" },
  error: { label: "Error", className: "bg-destructive/15 text-destructive" },
  // A checkout that expired unpaid: nothing was charged. Hidden unless asked for.
  expired: {
    label: "Sin completar",
    className: "bg-muted text-muted-foreground",
  },
}

export default function AccountPage() {
  useDocumentTitle("Mi cuenta")
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  return (
    <Page className="space-y-12">
      <PageHeader
        eyebrow={ROLE_LABEL[user.role]}
        title={`Hola, ${user.name.split(" ")[0]}`}
        description={`${user.email} · con nosotros desde el ${formatDate(user.createdAt)}`}
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={async () => {
              await logout()
              navigate("/")
            }}
          >
            <Icon icon={Logout01Icon} className="size-4" /> Cerrar sesión
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Subscription />
        <Profile />
      </div>
      <ApiKeysSection />
      <Payments />
      <Favorites />
    </Page>
  )
}

function Subscription() {
  const mine = useMySubscription()
  const cancel = useCancelSubscription()
  if (!mine.data) return <Skeleton className="h-48 rounded-3xl" />
  const { plan, subscription } = mine.data

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        Tu plan
      </p>
      <h2 className="mt-2 font-heading text-4xl font-bold text-highlight">
        {plan.name}
      </h2>
      {subscription ? (
        <p className="mt-2 text-muted-foreground">
          {subscription.status === "canceled"
            ? `Cancelado: sigue activo hasta el ${formatDate(subscription.currentPeriodEnd)}.`
            : `Activo hasta el ${formatDate(subscription.currentPeriodEnd)}.`}
        </p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          El plan gratis, para siempre.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <Link to="/planes">
            {subscription ? "Cambiar de plan" : "Mejorar plan"}
          </Link>
        </Button>
        {subscription?.status === "active" && (
          <Button
            variant="ghost"
            className="rounded-full text-muted-foreground"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () =>
                  toast.success(
                    "Suscripción cancelada. Sigue activa hasta el fin del periodo."
                  ),
                onError: (error) => toast.error(errorMessage(error)),
              })
            }
          >
            Cancelar suscripción
          </Button>
        )}
      </div>
    </section>
  )
}

function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  })

  const rename = useMutation({
    mutationFn: () =>
      call(api.PATCH("/v1/me/profile", { body: { name: name.trim() } })),
    onSuccess: (updated) => {
      sessionStore.updateUser(updated)
      toast.success("Nombre actualizado")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
  const changePassword = useMutation({
    mutationFn: () => call(api.PUT("/v1/me/password", { body: passwords })),
    onSuccess: () => {
      setPasswords({ currentPassword: "", newPassword: "" })
      toast.success("Contraseña cambiada")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const onRename = (event: FormEvent) => {
    event.preventDefault()
    rename.mutate()
  }
  const onPassword = (event: FormEvent) => {
    event.preventDefault()
    changePassword.mutate()
  }

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6">
      <form onSubmit={onRename} className="flex items-end gap-2">
        <div className="flex-1">
          <FormField
            label="Nombre"
            name="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          className="h-11 rounded-xl"
          disabled={rename.isPending || !name.trim() || name === user?.name}
        >
          Guardar
        </Button>
      </form>
      <form
        onSubmit={onPassword}
        className="space-y-3 border-t border-border pt-6"
      >
        <FormField
          label="Contraseña actual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={passwords.currentPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, currentPassword: e.target.value })
          }
        />
        <FormField
          label="Nueva contraseña"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          hint="10 caracteres o más, con letras y números."
          value={passwords.newPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, newPassword: e.target.value })
          }
        />
        <Button
          type="submit"
          variant="secondary"
          className="rounded-xl"
          disabled={
            changePassword.isPending ||
            !passwords.currentPassword ||
            !passwords.newPassword
          }
        >
          Cambiar contraseña
        </Button>
      </form>
    </section>
  )
}

function Payments() {
  const payments = usePayments()
  const [showExpired, setShowExpired] = useState(false)
  const all = payments.data ?? []
  const expiredCount = all.filter((p) => p.status === "expired").length
  const items = showExpired ? all : all.filter((p) => p.status !== "expired")

  return (
    <section aria-labelledby="pagos">
      <h2 id="pagos" className="text-2xl font-bold">
        Historial de pagos
      </h2>
      {payments.isPending ? (
        <Skeleton className="mt-4 h-32 rounded-3xl" />
      ) : items.length === 0 ? (
        <p className="mt-2 text-muted-foreground">Todavía no hay pagos.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-border">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-muted/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3">
                  Plan
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Valor
                </th>
                <th scope="col" className="px-4 py-3">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3">
                  Referencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold uppercase">
                    {p.planId}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        PAYMENT_STATUS[p.status].className
                      )}
                    >
                      {PAYMENT_STATUS[p.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {expiredCount > 0 && (
        <Button
          variant="link"
          className="mt-2 h-auto px-0 text-muted-foreground"
          aria-expanded={showExpired}
          onClick={() => setShowExpired((v) => !v)}
        >
          {showExpired
            ? "Ocultar los intentos sin completar"
            : `Mostrar ${expiredCount} ${
                expiredCount === 1 ? "intento" : "intentos"
              } sin completar (no se cobró nada)`}
        </Button>
      )}
    </section>
  )
}

function Favorites() {
  const favorites = useFavorites()
  const items = favorites.data ?? []
  return (
    <section aria-labelledby="favoritas">
      <h2 id="favoritas" className="text-2xl font-bold">
        Tus favoritas
      </h2>
      {favorites.isPending ? (
        <Skeleton className="mt-4 h-48 rounded-3xl" />
      ) : items.length === 0 ? (
        <EmptyState
          className="mt-4"
          emoji="💛"
          title="Aún no tienes favoritas"
          description="Dale ⭐ en Descubrir o el corazón en cualquier bebida."
          action={
            <Button asChild className="rounded-full">
              <Link to="/descubrir">Ir a Descubrir</Link>
            </Button>
          }
        />
      ) : (
        <DrinkGrid className="mt-4">
          {items.map((f) => (
            <DrinkCard key={f.drink.id} drink={f.drink} />
          ))}
        </DrinkGrid>
      )}
    </section>
  )
}
