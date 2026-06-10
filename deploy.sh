#!/usr/bin/env bash
# ZENITH — one-command deploy: build images, start the stack, run migrations.
#   ./deploy.sh            build + up
#   ./deploy.sh --seed     also seed demo data (2 accounts, 50 trades)
#   ./deploy.sh --down     stop the stack
set -euo pipefail
cd "$(dirname "$0")"

if [[ "${1:-}" == "--down" ]]; then
  docker compose down
  exit 0
fi

if [[ ! -f .env ]]; then
  echo "→ No .env found — creating one from .env.example (demo mode)."
  cp .env.example .env
fi

echo "→ Building images…"
docker compose build

echo "→ Starting stack…"
docker compose up -d

echo "→ Waiting for API…"
API_PORT=$(grep -E '^API_PORT=' .env | cut -d= -f2)
API_PORT=${API_PORT:-4000}
for i in $(seq 1 60); do
  if curl -fsS "http://localhost:${API_PORT}/v1/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
  [[ $i == 60 ]] && { echo "API did not come up — check: docker compose logs api"; exit 1; }
done

if [[ "${1:-}" == "--seed" ]]; then
  echo "→ Seeding demo data…"
  docker compose exec api npx prisma db seed
fi

WEB_PORT=$(grep -E '^WEB_PORT=' .env | cut -d= -f2)
echo ""
echo "✓ ZENITH is up."
echo "  Web : http://localhost:${WEB_PORT:-3000}"
echo "  API : http://localhost:${API_PORT}/v1/health"
