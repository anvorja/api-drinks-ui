import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormField } from "@/components/auth/FormField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { ApiError, errorMessage } from "@/lib/api/errors"
import { safeNext } from "@/lib/redirect"

type Field = "name" | "email" | "password" | "birthDate"

const FIELD_BY_CODE: Partial<Record<string, Field>> = {
  EMAIL_TAKEN: "email",
  INVALID_EMAIL: "email",
  WEAK_PASSWORD: "password",
  INVALID_BIRTH_DATE: "birthDate",
  INVALID_NAME: "name",
}

const today = () => new Date().toISOString().slice(0, 10)

export default function RegisterPage() {
  useDocumentTitle("Crear cuenta")
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get("next"), "/descubrir")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    birthDate: "",
  })
  const [errors, setErrors] = useState<Partial<Record<Field | "form", string>>>(
    {}
  )
  const [pending, setPending] = useState(false)

  if (user && !pending) return <Navigate to={next} replace />

  const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: event.target.value }))

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setErrors({})
    try {
      const me = await register(form)
      toast.success(
        `¡Te damos la bienvenida, ${me.name.split(" ")[0]}! Ahora a descubrir tu ADN.`
      )
      navigate(next, { replace: true })
    } catch (error) {
      setPending(false)
      if (error instanceof ApiError) {
        const field = FIELD_BY_CODE[error.code]
        if (field) return setErrors({ [field]: errorMessage(error) })
        if (error.code === "VALIDATION_FAILED" && error.details?.length) {
          return setErrors(
            Object.fromEntries(
              error.details.map((d) => [
                d.path.split(".")[0],
                "Revisa este campo.",
              ])
            )
          )
        }
      }
      setErrors({ form: errorMessage(error) })
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle={
        <>
          ¿Ya tienes una?{" "}
          <Link
            to={`/entrar${params.size ? `?${params}` : ""}`}
            className="font-medium text-highlight underline-offset-4 hover:underline"
          >
            Entra
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          label="Nombre"
          name="name"
          autoComplete="given-name"
          required
          maxLength={100}
          value={form.name}
          onChange={set("name")}
          error={errors.name}
        />
        <FormField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="10 caracteres o más, con letras y números."
        />
        <FormField
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          required
          max={today()}
          value={form.birthDate}
          onChange={set("birthDate")}
          error={errors.birthDate}
          hint="Con 18 años o más verás también las bebidas con alcohol."
        />
        {errors.form && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.form}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full text-base"
          disabled={pending}
        >
          {pending ? "Creando…" : "Crear cuenta"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Tus datos solo sirven para personalizar tu experiencia. Disfruta con
          moderación.
        </p>
      </form>
    </AuthLayout>
  )
}
