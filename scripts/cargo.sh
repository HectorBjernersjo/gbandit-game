#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/env.sh"

docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" \
  run --rm \
  -e DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@${GAME_SLUG}-db:5432/${PGDATABASE}?sslmode=disable" \
  backend \
  sh -c "sqlx migrate run --source ./migrations && cargo $*"
