# Arquitectura

La app sigue la guía **Context + Custom Hooks** del curso: cada estado global tiene tres piezas
con una sola responsabilidad cada una. El estado que viene de la API vive en **TanStack Query**.

## Carpetas

```
src/
├── app/            App y router (rutas lazy, guardas)
├── config/         Configuración de entorno (VITE_* o window.__APP_CONFIG__)
├── contexts/       Solo createContext() y el tipo del contrato
│   ├── AuthContext.ts
│   └── ThemeContext.ts
├── providers/      Estado + lógica + efectos
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── QueryProvider.tsx
│   └── AppProviders.tsx   (los compone en orden)
├── hooks/          La única puerta de entrada para los componentes
│   ├── useAuth.ts, useTheme.ts
│   ├── api/        Un hook por caso de uso de la API (useDrinks, useTaste, useCocktle…)
│   └── useDebouncedValue.ts, useInView.ts, useDocumentTitle.ts
├── lib/            Código sin React: cliente de la API, sesión, errores, formato, radar
├── components/
│   ├── ui/         shadcn/ui (generado; se adapta, no se reescribe)
│   ├── layout/     Barra superior, barra inferior móvil, pie
│   ├── common/     Estados (vacío, error, edad, plan), encabezados, íconos
│   └── drinks/, taste/, discover/, cocktle/, auth/
└── pages/          Una pantalla por ruta (se cargan por partes)
```

## Flujo de datos

```
AuthProvider (estado + lógica)       TanStack Query (caché de la API)
        ↓                                       ↓
AuthContext (contrato)               hooks/api/useX (claves, llamadas, invalidación)
        ↓                                       ↓
useAuth() ─────────────→ componentes ←───────── useDrinks(), useMyTaste()…
```

- **Los componentes nunca importan un contexto ni el cliente HTTP.** Usan `useAuth()`,
  `useTheme()` o un hook de `hooks/api/`.
- **Los hooks de `hooks/api/` concentran**:
  - las claves de caché;
  - las llamadas tipadas;
  - qué se invalida después de cada mutación. Por ejemplo, un swipe invalida el ADN, los
    favoritos y las estadísticas.

## Cliente de la API

- `openapi/openapi.json` es una copia versionada del contrato de la API.
- `pnpm api:types` genera `src/lib/api/schema.d.ts`. Si la API cambia un campo, `tsc` falla
  donde se usa.
- `pnpm api:check`, que corre en la CI, falla si el cliente tipado no corresponde al contrato.
- `call(api.GET(...))` devuelve los datos o lanza un `ApiError` con:
  - `code`, `status`, `requestId` y `retryAfter`;
  - `NETWORK_ERROR` si no hay conexión.

## Sesión

| Pieza                        | Dónde vive                      | Por qué                                                              |
| ---------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| Access token (JWT, 15 min)   | Memoria (`lib/auth/session.ts`) | Nunca en `localStorage`: un XSS no puede robarlo después             |
| Refresh token                | Cookie httpOnly `Path=/v1/auth` | JavaScript no puede leerla                                           |
| Marca `crazy-drinks.session` | `localStorage`                  | Solo dice "hubo sesión"; evita un refresh inútil a quien nunca entró |

1. **Al cargar:** si hubo sesión, `POST /v1/auth/refresh` la recupera desde la cookie. Las
   pantallas esperan (splash) para no pedir datos dos veces, como anónimo y como usuario.
2. **Middleware del cliente:** agrega el `Bearer`, renueva el token 30 s antes de que venza y,
   si la API aún responde `401 INVALID_ACCESS_TOKEN`, renueva una vez y repite la petición.
3. **Un solo refresh a la vez:** las renovaciones simultáneas comparten una sola petición. El
   refresh token rota en cada uso, y dos refresh en paralelo revocarían toda la familia de
   sesiones.
4. **Cambio de usuario (login o logout):** se reinicia la caché. Los resultados dependen de la
   edad y del plan de cada persona.

## Errores

- Se decide por `code`, nunca por `message`, como pide la API.
- `errorMessage(error)` traduce cada código a español.
- `<ErrorState>` convierte el código en la pantalla correcta:

  | Código           | Pantalla                                                        |
  | ---------------- | --------------------------------------------------------------- |
  | `AGE_RESTRICTED` | Aviso de edad, con "Entrar" y "Ver sin alcohol"                 |
  | `PLAN_LIMIT`     | Invitación a los planes                                         |
  | `AUTH_REQUIRED`  | Invitación a entrar, volviendo a la misma pantalla              |
  | Otros            | Mensaje y botón de reintentar, con el `requestId` para reportar |

- **Reintentos:** TanStack Query no reintenta errores 4xx. Con `429` espera lo que dice
  `Retry-After`.

## Qué ofrece cada cuenta

`src/lib/entitlements.ts` es el único lugar que traduce el rol y el plan en qué se ofrece. La API
es la que hace cumplir los permisos; la interfaz solo evita mostrar botones que terminan en
"no permitido".

- **`canManageVenues(role)`:** true para `venue_owner` y `admin`. Decide si aparece "Mi bar" en el
  menú (`visible` en `nav.ts`).
- **`planPerks(plan)`:** agrupa los límites del plan en dos grupos:
  - **"Para tu bar":** bares, inventario y carta con márgenes;
  - **"API para tus integraciones":** llaves y peticiones al día.
- **`usablePerkGroups(role)`:** qué grupos puede usar la cuenta. En `/planes`, una cuenta personal
  ve los beneficios de bar atenuados y marcados "Cuentas de bar".
- **`nextStepAfterUpgrade(role)`:** adónde lleva el botón principal después de pagar.

Una cuenta personal que compra Pro gana más llaves de API (3 en lugar de 1) y más peticiones al
día (10.000 en lugar de 100). Las gestiona en _Mi cuenta → API para tus integraciones_. El secreto
de una llave se muestra una sola vez: vive en el estado del componente, nunca en la caché.

## Rutas

| Ruta                                                                       | Sesión | Pantalla                                                      |
| -------------------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `/`                                                                        | —      | Inicio: coctel del día con su ADN, cómo funciona, destacados  |
| `/explorar`                                                                | —      | Filtros en la URL (se pueden compartir), scroll infinito      |
| `/bebida/:id`                                                              | —      | Receta ES/EN, ingredientes, ADN de la bebida, gemelas         |
| `/adn/:slug`                                                               | —      | ADN público de otra persona y compatibilidad                  |
| `/lab`                                                                     | —      | Despensa inteligente y cocteles por estado de ánimo           |
| `/planes`                                                                  | —      | Planes y checkout de Wompi                                    |
| `/entrar`, `/registro`, `/recuperar-contrasena`, `/restablecer-contrasena` | —      | Acceso                                                        |
| `/descubrir`                                                               | ✔      | Swipe con ADN en vivo                                         |
| `/mi-adn`                                                                  | ✔      | Perfil, recomendaciones, tarjeta compartible, compatibilidad  |
| `/cocktle`                                                                 | ✔      | Reto diario (clásico o zero)                                  |
| `/pago/resultado`                                                          | ✔      | Vuelta de Wompi: verifica y reintenta mientras esté pendiente |
| `/mi-bar`, `/mi-bar/:id`                                                   | ✔      | Carta inteligente, "te falta poco", inventario                |
| `/cuenta`                                                                  | ✔      | Perfil, plan, llaves de API (`#api`), pagos y favoritas       |

Las rutas con sesión pasan por `<RequireAuth>`. Sin sesión, llevan a `/entrar?next=<ruta>` y,
al entrar, se vuelve a la misma pantalla. `safeNext` solo acepta rutas propias, así que no se
puede redirigir a otro sitio.

## Pruebas

`pnpm test` corre Vitest con jsdom. Cubre:

- la lógica pura: radar, filtros en la URL, errores, redirecciones seguras;
- la sesión: refresh compartido, sesión vencida, fallo de red;
- los componentes clave: `DnaRadar` y `ErrorState`.
