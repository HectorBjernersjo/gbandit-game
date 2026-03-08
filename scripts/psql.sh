#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/env.sh"

exec docker compose -p "$GAME_PROJECT" -f "$ROOT_DIR/docker-compose.yml" exec db \
  psql -U "${PGUSER:-postgres}" -d "${PGDATABASE:-app}" "$@"
