#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/env.sh"
trap 'on_fail "$GAME_PROJECT" "$ROOT_DIR/docker-compose.yml"' ERR

# Auto-allow direnv if installed
if command -v direnv &> /dev/null; then
  echo "=== Allowing direnv ==="
  direnv allow "$ROOT_DIR"
  echo
fi

echo "=== Writing CLAUDE.md ==="
envsubst < "$ROOT_DIR/AGENTS.template.md" > "$ROOT_DIR/AGENTS.md"
envsubst < "$ROOT_DIR/AGENTS.template.md" > "$ROOT_DIR/CLAUDE.md"
echo

echo "=== Stopping any existing game containers ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" down 2>/dev/null || true
echo

# --- Check infra is running ---
echo "=== Checking infra ==="
if curl -s -o /dev/null --max-time 2 "http://localhost:$INFRA_PORT/health"; then
  echo "Infra running on port $INFRA_PORT"
else
  echo "ERROR: Infra is not running on port $INFRA_PORT."
  echo "Start it first from the infra repo: ./scripts/init.sh"
  exit 1
fi
echo

# --- Shared network ---
docker network create gbandit-net 2>/dev/null || true

# --- Game stack ---
echo "=== Game stack ($GAME_SLUG) ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" up --build --wait -d db backend

echo
echo "=== Seeding database ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" up seed

echo
echo "=== Starting frontend ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" up --build --wait --no-deps -d frontend

echo
echo "=== Logs ==="
docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" logs --timestamps
echo

echo "=== Starting Chrome with remote debugging ==="

if curl -s -o /dev/null --max-time 2 "http://localhost:$CHROME_DEBUG_PORT/json/version"; then
  echo "Chrome already running on port $CHROME_DEBUG_PORT, skipping"

elif command -v /usr/bin/chromium >/dev/null 2>&1; then
  /usr/bin/chromium \
    --remote-debugging-port="$CHROME_DEBUG_PORT" \
    --user-data-dir="/tmp/chrome_debug_$GAME_SLUG" \
    --no-first-run \
    >/dev/null 2>&1 &
  echo "Chrome started on port $CHROME_DEBUG_PORT"

else
  echo "Chromium not found. To enable Chrome remote debugging, run:"
  echo "  google-chrome --remote-debugging-port=$CHROME_DEBUG_PORT --user-data-dir=/tmp/chrome_debug_$GAME_SLUG --no-first-run &"
fi

echo
echo "Game running at:"
echo "  Game:     http://$GAME_SLUG.gbandit.localhost:$INFRA_PORT"
echo "  Database: localhost:$DB_PORT"
echo "  Chrome:   http://localhost:$CHROME_DEBUG_PORT"
