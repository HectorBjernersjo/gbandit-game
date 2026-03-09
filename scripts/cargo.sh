#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/env.sh"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -v "$ROOT_DIR/backend:/app" \
  -w /app \
  --network gbandit-net \
  -e DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@${GAME_SLUG}-db:5432/${PGDATABASE}?sslmode=disable" \
  "${GAME_PROJECT}-backend" \
  cargo "$@"
