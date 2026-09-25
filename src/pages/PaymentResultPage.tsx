import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { motion } from "motion/react"

import { Page } from "@/components/common/PageHeader"
import { EmptyState, ErrorState } from "@/components/common/States"
import { Button } from "@/components/ui/button"
import type { Payment } from "@/hooks/api/types"
import { useVerifyPayment } from "@/hooks/api/useBilling"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { nextStepAfterUpgrade } from "@/lib/entitlements"
import { formatDateTime, formatMoney } from "@/lib/format"

const POLL_MS = 3000
const MAX_POLLS = 20

const STATUS: Record<
  Payment["status"],
  { emoji: string; title: string; text: string }
> = {
  approved: {
    emoji: "🥂",
    title: "¡Pago aprobado!",
    text: "Tu plan ya está activo.",
  },
  pending: {
    emoji: "⏳",
    title: "Procesando tu pago…",
    text: "El banco aún no confirma. No cierres esta página: la revisamos cada pocos segundos.",
  },
  declined: {
    emoji: "🙅",
    title: "Pago rechazado",
    text: "El banco no aprobó el pago. Puedes intentarlo de nuevo con otro medio.",
  },
  voided: {
    emoji: "↩️",
    title: "Pago anulado",
    text: "La transacción se anuló. No se hizo ningún cobro.",
  },
  error: {
    emoji: "⚠️",
    title: "Hubo un error con el pago",
    text: "Wompi reportó un error. Intenta de nuevo en unos minutos.",
  },
}

/**
 * Wompi sends the browser back here with ?id=<transactionId>. Coming back reloads the app,
 * so the session was recovered from the cookie before this renders (see docs/desarrollo-local.md).
 */
export default function PaymentResultPage() {
  useDocumentTitle("Resultado del pago")
  const { user } = useAuth()
  const nextStep = nextStepAfterUpgrade(user?.role)
  const [params] = useSearchParams()
  const transactionId = params.get("id")
  const verify = useVerifyPayment()
  const [polls, setPolls] = useState(0)
  const started = useRef(false)
  const { mutate } = verify

  useEffect(() => {
    if (!transactionId || started.current) return
    started.current = true
    mutate(transactionId)
  }, [transactionId, mutate])

  // PSE and some cards settle a few seconds later: ask again while pending.
  const status = verify.data?.status
  useEffect(() => {
    if (!transactionId || status !== "pending" || polls >= MAX_POLLS) return
    const timer = setTimeout(() => {
      setPolls((n) => n + 1)
      mutate(transactionId)
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [status, polls, transactionId, mutate])

  if (!transactionId) {
    return (
      <Page>
        <EmptyState
          emoji="🧾"
          title="No hay pago que revisar"
          description="Esta página es la vuelta desde Wompi. Si pagaste, revisa tu historial en tu cuenta."
          action={
            <Button asChild className="rounded-full">
              <Link to="/cuenta">Ir a mi cuenta</Link>
            </Button>
          }
        />
      </Page>
    )
  }

  if (verify.isError) {
    return (
      <Page>
        <ErrorState
          error={verify.error}
          onRetry={() => mutate(transactionId)}
        />
      </Page>
    )
  }

  const payment = verify.data
  const view = STATUS[payment?.status ?? "pending"]

  return (
    <Page className="max-w-2xl">
      <motion.section
        key={payment?.status ?? "loading"}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[2rem] border border-border bg-card p-8 text-center"
        aria-live="polite"
      >
        <motion.span
          className="inline-block text-7xl"
          animate={
            payment?.status === "pending" || !payment
              ? { rotate: [0, 12, -12, 0] }
              : { scale: [0.5, 1.2, 1] }
          }
          transition={
            payment?.status === "pending" || !payment
              ? { repeat: Infinity, duration: 1.6 }
              : { duration: 0.5 }
          }
          aria-hidden="true"
        >
          {view.emoji}
        </motion.span>
        <h1 className="mt-4 text-3xl font-bold">{view.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {payment?.status === "approved" ? nextStep.hint : view.text}
        </p>

        {payment && (
          <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3 text-left text-sm">
            <Detail label="Plan" value={payment.planId.toUpperCase()} />
            <Detail
              label="Valor"
              value={formatMoney(payment.amount, payment.currency)}
            />
            <Detail label="Referencia" value={payment.reference} mono />
            <Detail label="Fecha" value={formatDateTime(payment.updatedAt)} />
          </dl>
        )}

        {payment?.status === "pending" && polls >= MAX_POLLS && (
          <p className="mt-6 text-sm text-muted-foreground">
            Está tardando más de lo normal. Te avisaremos en tu historial de
            pagos cuando se confirme.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {payment?.status === "approved" ? (
            <Button asChild size="lg" className="rounded-full">
              <Link to={nextStep.to}>{nextStep.label}</Link>
            </Button>
          ) : payment && payment.status !== "pending" ? (
            <Button asChild size="lg" className="rounded-full">
              <Link to="/planes">Intentar de nuevo</Link>
            </Button>
          ) : null}
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/cuenta">Ver mis pagos</Link>
          </Button>
        </div>
      </motion.section>
    </Page>
  )
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "truncate font-mono text-xs" : "font-semibold"}>
        {value}
      </dd>
    </div>
  )
}
