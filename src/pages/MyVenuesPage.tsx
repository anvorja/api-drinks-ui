import { Store01Icon } from "@hugeicons/core-free-icons"
import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router"
import { toast } from "sonner"

import { FormField } from "@/components/auth/FormField"
import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCreateVenue, useMyVenues } from "@/hooks/api/useVenues"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"
import { canManageVenues } from "@/lib/entitlements"

export default function MyVenuesPage() {
  useDocumentTitle("Mi bar")
  const { user } = useAuth()
  const venues = useMyVenues()
  const canOwn = canManageVenues(user?.role)

  if (venues.data?.length === 1) {
    return <Navigate to={`/mi-bar/${venues.data[0]!.id}`} replace />
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Para bares"
        title="Mi bar"
        description="Tu inventario convertido en carta: qué puedes servir hoy, cuánto te cuesta y a cuánto venderlo."
      />
      <div className="mt-10">
        {venues.isPending ? (
          <Skeleton className="h-48 rounded-3xl" />
        ) : venues.isError ? (
          <ErrorState error={venues.error} onRetry={() => venues.refetch()} />
        ) : venues.data.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.data.map((venue) => (
              <li key={venue.id}>
                <Link
                  to={`/mi-bar/${venue.id}`}
                  className="block rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-amber/50"
                >
                  <Icon icon={Store01Icon} className="size-8 text-highlight" />
                  <h2 className="mt-3 text-xl font-bold">{venue.name}</h2>
                  <p className="text-muted-foreground">{venue.city}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : canOwn ? (
          <CreateVenue />
        ) : (
          <EmptyState
            icon={Store01Icon}
            title="Las herramientas de bar son para cuentas de bar"
            description="Tu cuenta es personal. Si administras un bar, pide a un administrador que la convierta en cuenta de bar. Mientras tanto, tu plan te da acceso a la API."
            action={
              <Button asChild className="rounded-full">
                <Link to="/cuenta#api">Ver mi acceso a la API</Link>
              </Button>
            }
          />
        )}
      </div>
    </Page>
  )
}

function CreateVenue() {
  const create = useCreateVenue()
  const [form, setForm] = useState({
    name: "",
    city: "",
    currency: "COP",
    targetPourCost: "22",
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    create.mutate(
      {
        name: form.name.trim(),
        city: form.city.trim(),
        currency: form.currency.trim().toUpperCase(),
        targetPourCost: Number(form.targetPourCost) / 100,
      },
      {
        onSuccess: () =>
          toast.success("¡Bar creado! Ahora carga tu inventario."),
        onError: (error) => toast.error(errorMessage(error)),
      }
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg space-y-4 rounded-3xl border border-border bg-card p-6"
    >
      <h2 className="text-xl font-bold">Registra tu bar</h2>
      <FormField
        label="Nombre"
        name="name"
        required
        maxLength={120}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <FormField
        label="Ciudad"
        name="city"
        required
        maxLength={80}
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Moneda"
          name="currency"
          required
          minLength={3}
          maxLength={3}
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        />
        <FormField
          label="Costo objetivo (%)"
          name="targetPourCost"
          type="number"
          min={5}
          max={60}
          required
          value={form.targetPourCost}
          onChange={(e) => setForm({ ...form, targetPourCost: e.target.value })}
          hint="Lo normal en bares: 18–24 %."
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full"
        disabled={create.isPending}
      >
        Crear bar
      </Button>
    </form>
  )
}
