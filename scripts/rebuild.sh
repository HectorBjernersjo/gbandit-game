#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
trap 'on_fail "$GAME_PROJECT" "$ROOT_DIR/docker-compose.yml"' ERR

SERVICE="${1:?Usage: rebuild.sh <service>}"

echo "=== Rebuilding $SERVICE ($GAME_SLUG) ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" up --build --wait --force-recreate -d "$SERVICE"

echo
echo "=== Logs ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" logs "$SERVICE" --timestamps
