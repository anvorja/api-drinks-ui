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
import {
  canManageVenues,
  planPerks,
  usablePerkGroups,
} from "@/lib/entitlements"
import { formatDate, formatMoney } from "@/lib/format"

const PITCH: Record<string, string> = {
  free: "Para empezar: tu bar y tus primeras integraciones.",
  pro: "Para el bar que quiere vender mejor cada coctel, y para tus apps.",
  business: "Para cadenas e integraciones sin límites.",
}

const RECOMMENDED = "pro"

export default function PlansPage() {
  useDocumentTitle("Planes")
  const { user } = useAuth()
  const plans = usePlans()
  const mine = useMySubscription()
  const currentPlanId = mine.data?.plan.id
  const personal = user !== null && !canManageVenues(user.role)

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
        description="Descubrir, jugar y compartir tu ADN es gratis siempre. Los planes son para bares que quieren su carta con números y para quienes integran nuestra API."
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

      {personal && (
        <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-card px-5 py-4 text-center text-sm text-pretty">
          Tu cuenta es <strong>personal</strong>: de cada plan aprovechas la{" "}
          <strong>API para tus integraciones</strong>. Las herramientas de bar
          se activan en cuentas de bar.
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
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-coral to-amber px-3 py-1 text-xs font-bold whitespace-nowrap text-night">
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
      <div className="mt-6 flex-1 space-y-5 text-sm">
        {planPerks(plan).map((group) => {
          // Signed-in personal accounts see bar perks dimmed, with who they are for.
          const usable = !user || usablePerkGroups(user.role).has(group.id)
          return (
            <div key={group.id} className={cn(!usable && "opacity-50")}>
              <p className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {group.title}
                {!usable && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] tracking-normal normal-case">
                    {group.audience}
                  </span>
                )}
              </p>
              <ul className="mt-2 space-y-2">
                {group.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Icon
                      icon={CheckmarkCircle02Icon}
                      className={cn(
                        "size-5",
                        usable ? "text-success" : "text-muted-foreground"
                      )}
                    />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
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
