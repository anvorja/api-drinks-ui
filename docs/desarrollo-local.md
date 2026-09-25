# Desarrollo local

## Todo en `lvh.me`, no en `localhost`

`lvh.me` es un dominio público que resuelve a `127.0.0.1`. Hay que usarlo por dos razones:

1. **Wompi rechaza `localhost` como URL de retorno.** Su firewall responde `403` al checkout.
2. **La cookie de sesión solo viaja dentro del mismo sitio.** Tiene `SameSite=Lax`. Si la app
   está en `localhost` y la API en `lvh.me`, o al revés, son sitios distintos y la cookie no se
   envía. Al volver de pagar, la sesión parece perdida.

| Qué                           | Valor                               |
| ----------------------------- | ----------------------------------- |
| Abrir la app en               | `http://lvh.me:5173`                |
| `VITE_APP_URL` (este repo)    | `http://lvh.me:5173`                |
| `VITE_API_URL` (este repo)    | `http://lvh.me:8090`                |
| `CORS_ORIGINS` (API)          | `http://lvh.me:5173`                |
| `PAYMENTS_REDIRECT_URL` (API) | `http://lvh.me:5173/pago/resultado` |

> Si en la API `CORS_ORIGINS` sigue en `http://localhost:5173`, el navegador bloquea todas las
> peticiones con credenciales y el login falla con un error de red. `POST /v1/auth/refresh`
> responde `401 ORIGIN_NOT_ALLOWED` a los orígenes que no están en la lista.

Vite escucha en el puerto de `VITE_APP_URL` y acepta ese host (`server.allowedHosts`). Si el
puerto está ocupado, no busca otro (`strictPort`): el retorno de Wompi apunta a ese puerto exacto.

## Pagos con Wompi (sandbox)

1. En `/planes`, "Pagar Pro con Wompi" crea el checkout (`POST /v1/me/subscription/checkout`) y
   el navegador va a Wompi.
2. Se paga con datos de prueba:
   - tarjeta aprobada `4242 4242 4242 4242`;
   - tarjeta rechazada `4111 1111 1111 1111`;
   - o PSE simulando que el banco aprueba.
3. Wompi vuelve a `/pago/resultado?id=<transacción>&env=test`. La página se recarga, así que:
   - la app recupera la sesión desde la cookie;
   - llama a `POST /v1/me/payments/verify`, que es idempotente;
   - si el pago sigue `pending` (PSE), vuelve a preguntar cada 3 s.

Detalle del flujo del lado de la API: `docs/pagos-wompi.md` en el repositorio de la API.

## Cuentas demo

Con `VITE_DEMO_ACCOUNTS=true`, `/entrar` muestra las cuentas que siembra la API (datos
sintéticos, contraseña `ApiDrinks2026`):

| Cuenta                     | Para mostrar                                                     |
| -------------------------- | ---------------------------------------------------------------- |
| `premium@api-drinks.local` | ADN, swipe, Cocktle, tarjeta compartible (`/adn/laura-demo-adn`) |
| `bar@api-drinks.local`     | Carta de "La Barra Demo" con costos y márgenes                   |
| `basico@api-drinks.local`  | Pagar el plan Pro en el sandbox                                  |
| `menor@api-drinks.local`   | Solo bebidas sin alcohol y Cocktle zero                          |

## Actualizar el contrato de la API

Con la API corriendo:

```bash
pnpm api:sync    # descarga ${VITE_API_URL}/docs/openapi.json a openapi/openapi.json
pnpm api:types   # regenera src/lib/api/schema.d.ts
pnpm typecheck   # muestra qué hay que ajustar
```

Los dos archivos se versionan juntos.
