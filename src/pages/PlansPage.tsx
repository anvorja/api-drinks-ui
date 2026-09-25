import { CheckmarkCircle02Icon, CrownIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { motion } from "motion/react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { Icon } from "@/components/common/Icon"
import { Page, PageHeader } from "@/components/common/PageHeader"
import { ErrorState } from "@/components/common/States"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { showDemoAccounts } from "@/config/env"
import type { Plan } from "@/hooks/api/types"
import {
  useCheckout,
  useMySubscription,
  usePlans,
} from "@/hooks/api/useBilling"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"
import { formatDate, formatMoney } from "@/lib/format"

const PITCH: Record<string, string> = {
  free: "Para probar con tu bar y tu despensa.",
  pro: "Para el bar que quiere vender mejor cada coctel.",
  business: "Para cadenas e integraciones sin límites.",
}

const RECOMMENDED = "pro"

function features(plan: Plan) {
  const { limits } = plan
  const many = (n: number | null, one: string, other: string) =>
    n === null ? `${other} ilimitados` : `${n} ${n === 1 ? one : other}`
  return [
    many(limits.venues, "bar", "bares"),
    `${limits.inventoryItems === null ? "Inventario ilimitado" : `${limits.inventoryItems} ítems de inventario`}`,
    limits.menuPricing
      ? "Carta con costo, precio sugerido y margen"
      : "Carta sin costos ni márgenes",
    many(limits.apiKeys, "llave de API", "llaves de API"),
    `${limits.apiDailyRequests.toLocaleString("es-CO")} peticiones de API al día`,
  ]
}

export default function PlansPage() {
  useDocumentTitle("Planes")
  const plans = usePlans()
  const mine = useMySubscription()
  const currentPlanId = mine.data?.plan.id

  return (
    <Page>
      <PageHeader
        className="md:flex-col md:items-center md:text-center [&>div]:mx-auto"
        eyebrow="Planes"
        title={
          <>
            Cobra lo que vale <span className="text-gradient">cada coctel</span>
          </>
        }
        description="Descubrir, jugar y compartir tu ADN es gratis siempre. Los planes son para bares que quieren su carta con números."
      />

      {mine.data?.subscription && (
        <p className="mx-auto mt-6 w-fit rounded-full border border-amber/40 bg-amber/10 px-4 py-2 text-sm">
          Tienes <strong>{mine.data.plan.name}</strong>{" "}
          {mine.data.subscription.status === "canceled"
            ? "hasta"
            : "· se renueva el"}{" "}
          {formatDate(mine.data.subscription.currentPeriodEnd)}
        </p>
      )}

      {plans.isError ? (
        <ErrorState
          className="mt-10"
          error={plans.error}
          onRetry={() => plans.refetch()}
        />
      ) : (
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.isPending
            ? Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-[30rem] rounded-3xl" />
              ))
            : plans.data.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  current={plan.id === currentPlanId}
                />
              ))}
        </div>
      )}

      {showDemoAccounts && (
        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
          🧪 Pagos en <strong>sandbox de Wompi</strong>: no se cobra dinero
          real. Tarjeta aprobada{" "}
          <code className="rounded bg-muted px-1">4242 4242 4242 4242</code>,
          rechazada{" "}
          <code className="rounded bg-muted px-1">4111 1111 1111 1111</code>, o
          PSE.
        </p>
      )}
    </Page>
  )
}

function PlanCard({
  plan,
  index,
  current,
}: {
  plan: Plan
  index: number
  current: boolean
}) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const checkout = useCheckout()
  const recommended = plan.id === RECOMMENDED
  const free = plan.monthlyPrice <= 0

  const buy = () => {
    if (!user) {
      navigate(`/entrar?next=${encodeURIComponent("/planes")}`)
      return
    }
    checkout.mutate(plan.id, {
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-7",
        recommended
          ? "border-amber/60 shadow-2xl shadow-coral/20 md:-translate-y-3"
          : "border-border"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-coral to-amber px-3 py-1 text-xs font-bold text-night">
          <Icon icon={CrownIcon} className="size-3.5" /> El favorito de los
          bares
        </span>
      )}
      <h2 className="text-2xl font-bold">{plan.name}</h2>
      <p className="mt-1 min-h-10 text-sm text-muted-foreground">
        {PITCH[plan.id] ?? ""}
      </p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="font-heading text-4xl font-bold">
          {free ? "Gratis" : formatMoney(plan.monthlyPrice, plan.currency)}
        </span>
        {!free && <span className="text-muted-foreground">/mes</span>}
      </p>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features(plan).map((feature) => (
          <li key={feature} className="flex gap-2">
            <Icon
              icon={CheckmarkCircle02Icon}
              className="size-5 text-success"
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        size="lg"
        variant={recommended ? "default" : "outline"}
        className="mt-8 h-12 rounded-full text-base"
        disabled={current || free || checkout.isPending}
        onClick={buy}
      >
        {current
          ? "Tu plan actual"
          : free
            ? "Incluido al registrarte"
            : checkout.isPending
              ? "Abriendo Wompi…"
              : `Pagar ${plan.name} con Wompi`}
      </Button>
    </motion.article>
  )
}
