# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
[versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

### Añadido

- **Despliegue en Netlify.**
  - `netlify.toml` y proxy de `/v1/*` hacia la API (`API_ORIGIN`), para que la cookie de sesión
    siga siendo del mismo sitio.
  - `VITE_API_URL=/` significa "mismo origen".
- **Base del frontend.**
  - React 19, TypeScript, Vite, shadcn/ui, Tailwind 4 y TanStack Query.
  - Arquitectura Context + Custom Hooks.
- **Identidad visual Crazy Drinks.**
  - Tema oscuro y claro con interruptor.
  - Logo de copa con radar, Space Grotesk e Inter, y tokens de marca.
- **Cliente tipado de la API**, generado de su contrato OpenAPI (5.0.0), con verificación en la
  CI.
- **Sesión segura.**
  - Access token en memoria y refresh con cookie httpOnly.
  - Renovación automática, un solo refresh a la vez, y reintento ante un `401`.
- **Pantallas del recorrido de la demo.**
  - Inicio, Explorar (filtros en la URL y scroll infinito) y detalle de bebida con su ADN y
    gemelas.
  - Entrar (con cuentas demo), registro y recuperación de contraseña.
  - Descubrir (swipe con gestos y teclado, ADN en vivo) y Mi ADN (recomendaciones, tarjeta
    compartible, compatibilidad).
  - ADN público, Cocktle (clásico o zero) y Lab (despensa y estados de ánimo).
  - Planes con checkout de Wompi y vuelta del pago con verificación.
  - Carta inteligente del bar con inventario, y Mi cuenta.
- **Buscador global** (Ctrl K) que tolera errores.
- **Pruebas** con Vitest y Testing Library.
- **Imagen Docker** con nginx sin privilegios y configuración en tiempo de ejecución (`API_URL`).
- **CI/CD** con GitHub Actions, publicación en GHCR y rulesets de `main` y `develop`.
