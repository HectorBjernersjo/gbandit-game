#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Running backend tests ($GAME_SLUG) ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" \
  run --rm --no-deps \
  -e DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@db:5432/${PGDATABASE}?sslmode=disable" \
  backend \
  sh -c "sqlx migrate run --source ./migrations && cargo test -- $*"
