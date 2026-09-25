# Despliegue

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

| Job (check requerido) | Qué hace                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Calidad y build**   | Prettier, `tsc`, ESLint, pruebas, `api:check` (cliente tipado al día) y build                                                                                                                            |
| **Imagen Docker**     | En un PR: build y prueba de humo del contenedor (health, `config.js` y una ruta de la app). En un push a `main` o `develop`: publica `ghcr.io/<repo>` con las etiquetas `sha-<7>` y el nombre de la rama |

## Rulesets

`.github/rulesets/main.json` y `develop.json` protegen las ramas:

- no se pueden borrar ni reescribir;
- todo entra por PR;
- los dos checks deben pasar.

`main` solo acepta **merge commit** y `develop` solo **squash**.

Para importarlos: _Settings → Rules → Rulesets → New ruleset → Import a ruleset_.

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
