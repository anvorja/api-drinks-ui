import { useMutation } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormField } from "@/components/auth/FormField"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { call, errorMessage } from "@/lib/api/errors"
import { rawApi } from "@/lib/api/http"

/** Destination of the recovery e-mail (the API's PASSWORD_RESET_URL?token=…). */
export default function ResetPasswordPage() {
  useDocumentTitle("Nueva contraseña")
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [password, setPassword] = useState("")
  const reset = useMutation({
    mutationFn: () =>
      call(
        rawApi.POST("/v1/auth/password/reset", {
          body: { token, newPassword: password },
        })
      ),
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    reset.mutate()
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Elige una que no uses en otro lado."
    >
      {!token ? (
        <p className="text-destructive">
          Falta el token del enlace. Pide uno nuevo en{" "}
          <Link to="/recuperar-contrasena" className="underline">
            recuperar contraseña
          </Link>
          .
        </p>
      ) : reset.isSuccess ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-lg font-semibold">¡Listo! 🔐</p>
          <p className="mt-2 text-muted-foreground">
            Ya puedes entrar con tu nueva contraseña.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/entrar">Entrar</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Nueva contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="10 caracteres o más, con letras y números."
            error={reset.isError ? errorMessage(reset.error) : undefined}
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full"
            disabled={reset.isPending || !password}
          >
            {reset.isPending ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
