# Crazy Drinks · Web

Frontend de [api-drinks](https://github.com/anvorja/api-crazy-drinks): descubre tu ADN de sabor
haciendo swipe entre cocteles, juega Cocktle, compártelo con tus amigos y, si tienes un bar, arma
tu carta con costos y márgenes.

> _No te decimos qué tomar: te decimos quién eres cuando lo tomas._

El desarrollo del frontend continúa en este repositorio
(`/home/anborja/Escritorio/proyectos-nest/api-drinks-ui`), con las directrices de la sección
[Directrices del proyecto](#directrices-del-proyecto).

## Stack

| Pieza                                  | Uso                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| **React 19 + TypeScript + Vite**       | App de una sola página, rutas cargadas por partes (lazy)                            |
| **shadcn/ui + Tailwind CSS 4**         | Componentes accesibles (Radix) adaptados a la identidad visual                      |
| **TanStack Query**                     | Estado del servidor: caché, reintentos, scroll infinito, actualizaciones optimistas |
| **openapi-fetch + openapi-typescript** | Cliente tipado generado del contrato OpenAPI de la API                              |
| **React Router**                       | Rutas y guardas de sesión                                                           |
| **Motion**                             | Gestos del swipe y microanimaciones                                                 |
| **Vitest + Testing Library**           | Pruebas unitarias y de componentes                                                  |

## Empezar

Requisitos: Node 24 y pnpm 12 (`corepack enable`), y la API corriendo.

```bash
pnpm install
cp .env.example .env         # valores locales; ajusta si hace falta
pnpm dev                     # http://lvh.me:5173
```

Abre **`http://lvh.me:5173`, no `localhost`**. En la API, `CORS_ORIGINS` debe incluir
`http://lvh.me:5173`. El porqué (cookie de sesión y Wompi) está en
[docs/desarrollo-local.md](docs/desarrollo-local.md).

Con `VITE_DEMO_ACCOUNTS=true`, la pantalla de entrada muestra las cuentas demo de la API para
entrar con un clic.

## Scripts

| Script                                               | Qué hace                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                                           | Servidor de desarrollo en `VITE_APP_URL`                               |
| `pnpm build` / `pnpm preview`                        | Build de producción y vista previa                                     |
| `pnpm test` / `pnpm test:watch`                      | Pruebas (Vitest)                                                       |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | Calidad                                                                |
| `pnpm api:sync`                                      | Descarga el contrato de la API a `openapi/openapi.json`                |
| `pnpm api:types`                                     | Regenera `src/lib/api/schema.d.ts` desde el contrato                   |
| `pnpm api:check`                                     | Falla si el cliente tipado no corresponde al contrato (lo corre la CI) |

## Variables de entorno

| Archivo           | Para qué                                                | ¿Se sube?             |
| ----------------- | ------------------------------------------------------- | --------------------- |
| `.env.example`    | Plantilla con todas las variables                       | Sí                    |
| `.env`            | Valores locales para `pnpm dev`                         | **No** (`.gitignore`) |
| `.env.production` | Valores de Netlify; Vite también lo usa en `pnpm build` | **No** (`.gitignore`) |

Solo las `VITE_*` llegan al navegador: **nunca pongas secretos aquí**.

| Variable             | Ejemplo              | Para qué                              |
| -------------------- | -------------------- | ------------------------------------- |
| `VITE_APP_URL`       | `http://lvh.me:5173` | Dónde corre el servidor de desarrollo |
| `VITE_API_URL`       | `http://lvh.me:8090` | URL base de la API                    |
| `VITE_DEMO_ACCOUNTS` | `true`               | Muestra las cuentas demo al entrar    |

- **Netlify:** `VITE_API_URL=/`, porque la API se llama a través del proxy en el mismo origen.
- **Docker:** la URL de la API se da en tiempo de ejecución con `API_URL`.

Ver [docs/despliegue.md](docs/despliegue.md).

## Directrices del proyecto

1. **Gitflow.**
   - `feature/*` sale de `develop` y vuelve a `develop` con **Squash**.
   - `release/*` va a `main` con **merge commit** y luego a `develop` con Squash.
   - `hotfix/*` sale de `main`.
   - La rama principal se llama `main`.
2. **Arquitectura Context + Custom Hooks**, según la guía del curso (_Hooks - manual.pdf_):
   - `contexts/` define el contrato de cada contexto;
   - `providers/` implementa el estado y la lógica;
   - `hooks/` es la única puerta de entrada para los componentes.

   Detalle en [docs/arquitectura.md](docs/arquitectura.md).

3. **TanStack Query** para todo dato que viene de la API. Los contextos quedan para el estado
   global de la app (sesión y tema).
4. **CI/CD con GitHub Actions.** Cada PR a `main` o `develop` pasa por calidad, pruebas, build e
   imagen Docker. Cada push a esas ramas publica la imagen en GitHub Container Registry.
5. **Rulesets de GitHub.** `main` y `develop` están protegidas. Sus definiciones están versionadas
   en `.github/rulesets/` y se importan en _Settings → Rules → Rulesets → Import a ruleset_.
   Exigen los checks `Calidad y build` e `Imagen Docker`.
6. **Documentación en `docs/`**, igual que en la API.
7. **Tema claro y oscuro**, con un interruptor en la barra superior. El oscuro es el
   predeterminado; la elección se recuerda.
8. **Configuración siempre por variables de entorno**, nada fijo en el código.

## Documentación

- [Arquitectura](docs/arquitectura.md): capas, flujo de datos, sesión y manejo de errores.
- [Desarrollo local](docs/desarrollo-local.md): `lvh.me`, CORS, cookie de sesión y pagos con Wompi.
- [Diseño](docs/diseno.md): identidad visual, tokens, componentes y responsive.
- [Despliegue](docs/despliegue.md): Netlify + Render, imagen Docker, CI/CD y rulesets.

## Atribución

Datos e imágenes de bebidas: [TheCocktailDB](https://www.thecocktaildb.com). Disfruta con
moderación.
