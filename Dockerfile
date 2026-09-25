# syntax=docker/dockerfile:1

# 1. Build the static app with the exact lockfile.
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 2. Serve it with an unprivileged nginx. The API URL is read at container start
#    (API_URL), so one image works for any environment.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER root
RUN chmod +x /docker-entrypoint.d/40-app-config.sh \
  && chown nginx:nginx /usr/share/nginx/html/config.js
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
