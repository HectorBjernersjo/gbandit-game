#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env (committed defaults) and .env.local (secret overrides)
set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env"
if [ -f "$ROOT_DIR/.env.local" ]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env.local"
fi
set +a

# Show docker compose logs on failure. Call with: trap 'on_fail <project> <compose_file>' ERR
on_fail() {
  echo
  echo "=== FAILED — logs ==="
  docker compose -p "$1" -f "$2" logs --timestamps --tail 50
}

# --- Worktree detection (dynamic — cannot live in .env) ---
MAIN_WORKTREE="$(git -C "$ROOT_DIR" worktree list --porcelain | head -1 | sed 's/^worktree //')"
if [ "$ROOT_DIR" = "$MAIN_WORKTREE" ]; then
  export GAME_SLUG="default"
else
  export GAME_SLUG="$(basename "$ROOT_DIR")"
fi

# --- Per-worktree offset (for DB port isolation) ---
WT_HASH="$(printf '%s' "$ROOT_DIR" | sha1sum | cut -c1-8)"
OFFSET=$(( 0x${WT_HASH:0:4} % 1000 ))

export GAME_PROJECT="kognito-game-$GAME_SLUG"
export DB_PORT="$((54000 + OFFSET))"
export CHROME_DEBUG_PORT="$((9000 + OFFSET))"

# --- Host-side DATABASE_URL (for psql from host, not for docker) ---
export DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@localhost:${DB_PORT}/${PGDATABASE}?sslmode=disable"
