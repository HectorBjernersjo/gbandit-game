#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

docker compose -p "$GAME_PROJECT" -f "$SCRIPT_DIR/../docker-compose.yml" "$@"
