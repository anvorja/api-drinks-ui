import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormField } from "@/components/auth/FormField"
import { Button } from "@/components/ui/button"
import { showDemoAccounts } from "@/config/env"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { errorMessage } from "@/lib/api/errors"
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demoAccounts"
import { safeNext } from "@/lib/redirect"

export default function LoginPage() {
  useDocumentTitle("Entrar")
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get("next"))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (user && !pending) return <Navigate to={next} replace />

  const signIn = async (mail: string, pass: string) => {
    setPending(true)
    setError(null)
    try {
      const me = await login(mail, pass)
      toast.success(`¡Hola, ${me.name.split(" ")[0]}! 🍹`)
      navigate(next, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setPending(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void signIn(email, password)
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle={
        <>
          ¿Primera vez?{" "}
          <Link
            to={`/registro${params.size ? `?${params}` : ""}`}
            className="font-medium text-highlight underline-offset-4 hover:underline"
          >
            Crea tu cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full text-base"
          disabled={pending || !email || !password}
        >
          {pending ? "Entrando…" : "Entrar"}
        </Button>
        <p className="text-center text-sm">
          <Link
            to="/recuperar-contrasena"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Olvidé mi contraseña
          </Link>
        </p>
      </form>

      {showDemoAccounts && (
        <section aria-labelledby="demo" className="mt-10">
          <h2
            id="demo"
            className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
          >
            Cuentas demo · un clic
          </h2>
          <ul className="mt-3 grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => signIn(account.email, DEMO_PASSWORD)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-amber/60 disabled:opacity-50"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {account.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {account.who}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {account.shows}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AuthLayout>
  )
}
