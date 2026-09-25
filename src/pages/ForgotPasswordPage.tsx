import { useMutation } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { Link } from "react-router"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormField } from "@/components/auth/FormField"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { call, errorMessage } from "@/lib/api/errors"
import { rawApi } from "@/lib/api/http"

export default function ForgotPasswordPage() {
  useDocumentTitle("Recuperar contraseña")
  const [email, setEmail] = useState("")
  const request = useMutation({
    mutationFn: (mail: string) =>
      call(rawApi.POST("/v1/auth/password/forgot", { body: { email: mail } })),
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    request.mutate(email)
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Te enviamos un enlace para crear una nueva."
    >
      {request.isSuccess ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-lg font-semibold">Revisa tu correo 📬</p>
          <p className="mt-2 text-muted-foreground">
            Si <strong>{email}</strong> tiene una cuenta, te llegará un enlace
            en unos minutos.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/entrar">Volver a entrar</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            label="Correo"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {request.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(request.error)}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full"
            disabled={request.isPending || !email}
          >
            {request.isPending ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
