# Despliegue

## Netlify (frontend) + Render (API)

El navegador ve `*.netlify.app` y `*.onrender.com` como **sitios distintos**. Si la app llamara
directo a Render, la cookie de sesión sería de terceros y Safari, Firefox y Chrome la bloquean:
la sesión se perdería al recargar o al volver de Wompi.

Por eso **Netlify hace de proxy** de `/v1/*` hacia la API:

- el navegador habla solo con `https://<app>.netlify.app`;
- la cookie queda en el mismo sitio, con `SameSite=Lax` y `Path=/v1/auth`;
- las rutas de la app no empiezan por `/v1`, así que no chocan con el proxy.

### Volver de Wompi sin perder la sesión

1. Pagar en Wompi saca al navegador de la app. El access token vivía en memoria, así que se pierde.
2. Wompi redirige a `https://<app>.netlify.app/pago/resultado?id=<transacción>&env=test`.
3. La app carga y llama a `POST /v1/auth/refresh` **en su propio origen**. Netlify lo reenvía a
   Render. La cookie `refresh_token` viaja porque, para el navegador, es del mismo sitio. La sesión
   se recupera.
4. `/pago/resultado` llama a `POST /v1/me/payments/verify` y muestra el resultado. Mientras el pago
   siga pendiente, vuelve a preguntar.
5. El botón principal depende de la cuenta (`nextStepAfterUpgrade` en `src/lib/entitlements.ts`):

   | Cuenta   | Botón                                              |
   | -------- | -------------------------------------------------- |
   | De bar   | "Ver mi carta con márgenes"                        |
   | Personal | "Crear mi llave de API", que lleva a `/cuenta#api` |

Sin el proxy, el paso 3 falla: la cookie sería de terceros, el refresh no la llevaría y la persona
volvería del pago sin sesión.

`netlify.toml` fija el build, Node 24, pnpm y las cabeceras.
`scripts/netlify-redirects.mjs` genera `dist/_redirects` (el proxy y el fallback de la app)
a partir de `API_ORIGIN`, sin URLs fijas en el código.

### Variables en Netlify

_Site configuration → Environment variables_. Ninguna es secreta.

| Variable             | Valor                             | Para qué                                                       |
| -------------------- | --------------------------------- | -------------------------------------------------------------- |
| `VITE_API_URL`       | `/`                               | La API se llama en el mismo origen, a través del proxy         |
| `API_ORIGIN`         | `https://api-drinks.onrender.com` | Adónde envía el proxy `/v1/*`: la URL de Render, sin `/` final |
| `VITE_DEMO_ACCOUNTS` | `true`                            | Opcional: cuentas demo en la pantalla de entrada               |

Las `VITE_*` se fijan en el build: si cambias una, vuelve a desplegar.

### Variables en Render (API)

Además de las de base de datos, JWT, Wompi y demás del `.env.example` de la API:

| Variable                  | Valor                                                           |
| ------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`                | `production`                                                    |
| `TRUST_PROXY`             | `true` (Netlify y Render van delante; así la API ve la IP real) |
| `CORS_ORIGINS`            | `https://<app>.netlify.app`                                     |
| `REFRESH_COOKIE_SAMESITE` | `lax`                                                           |
| `REFRESH_COOKIE_SECURE`   | `true`                                                          |
| `REFRESH_COOKIE_DOMAIN`   | vacía                                                           |
| `PAYMENTS_REDIRECT_URL`   | `https://<app>.netlify.app/pago/resultado`                      |
| `PASSWORD_RESET_URL`      | `https://<app>.netlify.app/restablecer-contrasena`              |
| `MIGRATE_ON_START`        | `true`                                                          |

- **Puerto:** Render define `PORT` solo.
- **Health check:** `/health/ready`.
- **Webhook de Wompi:** los eventos van directo a Render,
  `https://api-drinks.onrender.com/v1/webhooks/wompi`.
- **Plan gratis de Render:** duerme tras la inactividad y tarda en despertar. El proxy de
  Netlify corta a los ~26 s, así que la primera petición puede fallar con `502` hasta que la API
  despierte. En un plan pago no pasa.

## Imagen Docker

- **Build:** Node 24 construye la app con el lockfile exacto.
- **Servidor:** `nginx-unprivileged` la sirve en el puerto **8080**, sin root.

```bash
docker build -t crazy-drinks-web .
docker run -p 8080:8080 -e API_URL=https://api.example.com crazy-drinks-web
```

**Configuración en tiempo de ejecución**

- Al arrancar, `docker/40-app-config.sh` escribe `/config.js` con
  `window.__APP_CONFIG__ = { apiUrl: API_URL }`.
- La misma imagen sirve para cualquier entorno, sin reconstruirla.
- Sin `API_URL`, el contenedor no arranca.

**nginx** (`docker/nginx.conf`)

| Qué                                      | Cómo se sirve                           |
| ---------------------------------------- | --------------------------------------- |
| Rutas de la app (`/mi-adn`, `/bebida/…`) | Devuelven `index.html`                  |
| `/assets/*` (con hash)                   | Caché de un año, `immutable`            |
| `index.html` y `config.js`               | Sin caché                               |
| `/healthz`                               | Responde `ok` (lo usa el `HEALTHCHECK`) |

Además envía las cabeceras `X-Content-Type-Options`, `Referrer-Policy` y `X-Frame-Options`.

**Sesión en producción:** la cookie de sesión exige que la app y la API compartan sitio, por
ejemplo `app.midominio.com` y `api.midominio.com`. En la API:

- `CORS_ORIGINS` debe incluir la URL de la app;
- `PAYMENTS_REDIRECT_URL` debe ser `https://<app>/pago/resultado`.

## CI/CD (`.github/workflows/ci-cd.yml`)

Corre en cada PR a `main` o `develop` y en cada push a esas ramas.

| Job (check requerido)                    | Qué hace                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Calidad y build**                      | Prettier, `tsc`, ESLint, pruebas, `api:check` (cliente tipado al día), build y **configuración de Netlify**: corre `scripts/netlify-redirects.mjs` y comprueba que escribe el proxy de `/v1` y el fallback de la app, y que rechaza un `API_ORIGIN` sin https |
| **Imagen Docker**                        | Build de la imagen y prueba de humo del contenedor: health, `config.js` y una ruta de la app                                                                                                                                                                  |
| **Publicar imagen** (solo push a `main`) | Espera a los dos checks. Toma **la misma imagen** que se probó (no la reconstruye) y la sube a Docker Hub como `latest` y `<sha>` (7 caracteres)                                                                                                              |

**Secretos** (_Settings → Secrets and variables → Actions_):

- `DOCKER_USERNAME`: la imagen es `<usuario>/api-drinks-ui`;
- `DOCKER_TOKEN`: access token de Docker Hub con permiso _Read & Write_.

El frontend no despliega su imagen en ningún lado, porque el sitio lo publica Netlify. La imagen
sirve para correrlo en cualquier otra plataforma.

### Qué valida cada cosa antes de producción

La imagen Docker y Netlify son **dos empaques distintos** del mismo build:

| Empaque | Proxy y rutas                 | URL de la API                |
| ------- | ----------------------------- | ---------------------------- |
| Docker  | `docker/nginx.conf`           | `API_URL` al arrancar        |
| Netlify | `netlify.toml` y `_redirects` | `VITE_API_URL=/` en el build |

Que la imagen funcione prueba el código, no la configuración de Netlify. Por eso:

1. "Calidad y build" verifica el script que genera `_redirects`.
2. El **Deploy Preview de Netlify** es check obligatorio en `develop`. Si el build o la publicación
   fallan en Netlify, el PR no se puede mergear.
   - "Header rules" y "Redirect rules" solo informan que Netlify leyó las reglas; no hace falta
     exigirlos aparte.
3. Producción se despliega con el push a `develop`, y eso solo pasa al mergear un PR con todos los
   checks aprobados.

## Rulesets

`.github/rulesets/main.json` y `develop.json` protegen las ramas:

- no se pueden borrar ni reescribir;
- todo entra por PR;
- deben pasar `Calidad y build` e `Imagen Docker`, y en `develop` también
  `netlify/crazydrinks-ui/deploy-preview`.

`main` solo acepta **merge commit** y `develop` solo **squash**.

El check de Netlify no se exige en `main`: Netlify solo genera Deploy Previews para los PR dirigidos
a su rama de producción (`develop`). En `main` ese check nunca llegaría y bloquearía el release.

Para importarlos: _Settings → Rules → Rulesets → New ruleset → Import a ruleset_. Si ya existen,
edita el de `develop` y agrega el check.

Los nombres de los jobs son los checks requeridos: si cambias uno en el workflow, cámbialo
también en los rulesets.

## Gitflow

1. `feature/*` sale de `develop`. Al terminar, PR a `develop` con **Squash**.
2. `release/X.Y.Z` sale de `develop`. Ahí se sube la versión en `package.json` y el
   `CHANGELOG`.
   - Antes del PR a `main`, sincroniza con `git merge -s ours origin/main`. Las vueltas a
     `develop` son squash y, sin este paso, el PR a `main` tendría conflictos.
   - Abre los dos PR (a `main` con merge commit y a `develop` con squash) **antes** de mergear
     cualquiera, porque la rama se borra al mergear.
3. Etiqueta `vX.Y.Z` sobre el merge en `main`.
4. `hotfix/*` sale de `main` y vuelve a `main` y a `develop`.
