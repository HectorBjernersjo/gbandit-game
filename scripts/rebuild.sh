#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE="${1:?Usage: rebuild.sh <service>}"

echo "=== Rebuilding $SERVICE ($GAME_SLUG) ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" build "$SERVICE"

if ! docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" up --wait --force-recreate --no-deps -d "$SERVICE"; then
  on_fail "$GAME_PROJECT" "$ROOT_DIR/docker-compose.yml" "$SERVICE"
  exit 1
fi

echo
echo "=== Logs ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" logs "$SERVICE" --timestamps
