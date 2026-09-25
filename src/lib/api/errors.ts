import type { components } from "./schema"

export type ErrorCode = components["schemas"]["ErrorResponse"]["code"]
type ErrorBody = components["schemas"]["ErrorResponse"]

/** Every failed API call becomes this. Decide by `code`, never by `message` (English hint). */
export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode | "NETWORK_ERROR"
  readonly details: ErrorBody["details"]
  readonly requestId?: string
  /** Seconds to wait, from Retry-After (429). */
  readonly retryAfter?: number

  constructor(init: {
    status: number
    code: ApiError["code"]
    message: string
    details?: ErrorBody["details"]
    requestId?: string
    retryAfter?: number
  }) {
    super(init.message)
    this.name = "ApiError"
    this.status = init.status
    this.code = init.code
    this.details = init.details
    this.requestId = init.requestId
    this.retryAfter = init.retryAfter
  }
}

export const isApiError = (error: unknown, code?: ApiError["code"]) =>
  error instanceof ApiError && (code === undefined || error.code === code)

type FetchResult<T> = { data?: T; error?: unknown; response: Response }

/** Returns the data of an openapi-fetch result or throws an ApiError. */
export function unwrap<T>(result: FetchResult<T>): T {
  const { data, error, response } = result
  if (response.ok) return data as T

  const body = (error ?? {}) as Partial<ErrorBody>
  const retryAfter = Number(response.headers.get("Retry-After"))
  throw new ApiError({
    status: response.status,
    code: body.code ?? "INTERNAL_ERROR",
    message: body.message ?? response.statusText,
    details: body.details,
    requestId:
      body.requestId ?? response.headers.get("X-Request-Id") ?? undefined,
    retryAfter:
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  })
}

const MESSAGES: Partial<Record<ApiError["code"], string>> = {
  NETWORK_ERROR: "No pudimos conectar con el servidor. Revisa tu conexión.",
  VALIDATION_FAILED: "Revisa los datos del formulario.",
  AUTH_REQUIRED: "Inicia sesión para continuar.",
  INVALID_CREDENTIALS: "Correo o contraseña incorrectos.",
  INVALID_ACCESS_TOKEN: "Tu sesión expiró. Vuelve a entrar.",
  INVALID_REFRESH_TOKEN: "Tu sesión expiró. Vuelve a entrar.",
  ORIGIN_NOT_ALLOWED:
    "La API no acepta este origen: revisa CORS_ORIGINS (debe incluir esta URL).",
  LOGIN_LOCKED: "Demasiados intentos. Espera un momento y vuelve a intentarlo.",
  AGE_RESTRICTED: "Este contenido es solo para mayores de 18 años.",
  ROLE_REQUIRED: "Tu cuenta no tiene permiso para esto.",
  FORBIDDEN: "No tienes permiso para esto.",
  PLAN_LIMIT: "Tu plan no incluye esto. Mejóralo para continuar.",
  RATE_LIMITED: "Vas muy rápido. Espera unos segundos.",
  EMAIL_TAKEN: "Ya existe una cuenta con ese correo.",
  INVALID_EMAIL: "Ese correo no parece válido.",
  WEAK_PASSWORD:
    "La contraseña necesita 10 caracteres o más, con letras y números.",
  INVALID_BIRTH_DATE: "Revisa tu fecha de nacimiento.",
  INVALID_NAME: "Revisa tu nombre.",
  WRONG_PASSWORD: "La contraseña actual no es correcta.",
  INVALID_RESET_TOKEN: "El enlace de recuperación no es válido o ya venció.",
  DRINK_NOT_FOUND: "No encontramos esa bebida.",
  MOOD_NOT_FOUND: "No conocemos ese estado de ánimo.",
  NO_TASTE_YET: "Aún no tienes ADN de sabor: dale like a algunas bebidas.",
  TASTE_LINK_NOT_FOUND: "Ese enlace de ADN no existe o ya no se comparte.",
  OWN_TASTE_LINK: "Ese es tu propio enlace: prueba con el de otra persona.",
  GAME_OVER: "El reto de hoy ya terminó. ¡Vuelve mañana!",
  DUPLICATE_GUESS: "Ya intentaste con esa bebida.",
  PLAN_NOT_FOUND: "Ese plan no existe.",
  PLAN_NOT_PURCHASABLE: "Ese plan no se puede comprar.",
  PAYMENTS_UNAVAILABLE: "Los pagos no están disponibles en este momento.",
  PAYMENT_NOT_FOUND: "No encontramos ese pago.",
  VENUE_NOT_FOUND: "No encontramos ese bar.",
  NOT_VENUE_OWNER: "Ese bar no es tuyo.",
  CATALOG_UNAVAILABLE: "El catálogo no está disponible ahora mismo.",
  UNAVAILABLE: "El servicio no está disponible ahora mismo.",
  NOT_FOUND: "No encontramos lo que buscas.",
}

/** Spanish text for the user; the API `message` is only a hint for developers. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "RATE_LIMITED" && error.retryAfter) {
      return `Vas muy rápido. Intenta de nuevo en ${error.retryAfter} s.`
    }
    return MESSAGES[error.code] ?? "Algo salió mal. Intenta de nuevo."
  }
  return "Algo salió mal. Intenta de nuevo."
}

/** Awaits an openapi-fetch call: returns its data, or throws ApiError (NETWORK_ERROR offline). */
export async function call<T>(request: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>
  try {
    result = await request
  } catch (error) {
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : String(error),
    })
  }
  return unwrap(result)
}
