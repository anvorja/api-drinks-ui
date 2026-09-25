#!/bin/sh
# Writes the runtime config the app reads before it boots (see src/config/env.ts).
set -eu
: "${API_URL:?Set API_URL (the API base URL, e.g. https://api.example.com)}"
cat > /usr/share/nginx/html/config.js <<JS
window.__APP_CONFIG__ = { apiUrl: "${API_URL}" };
JS
echo "config.js: apiUrl=${API_URL}"
