#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/env.sh"

CARGO_CACHE_DIR="$ROOT_DIR/.cache/cargo"
CARGO_TARGET_DIR="$ROOT_DIR/.cache/cargo-target"
mkdir -p "$CARGO_CACHE_DIR" "$CARGO_TARGET_DIR"

BACKEND_IMAGE="${GAME_PROJECT}-backend"
COMMAND="${1:-}"

if ! docker image inspect "$BACKEND_IMAGE" >/dev/null 2>&1; then
  echo "Backend image $BACKEND_IMAGE not found. Run ./scripts/init.sh or ./scripts/rebuild.sh backend first." >&2
  exit 1
fi

case "$COMMAND" in
  run|watch|serve)
    echo "./scripts/cargo.sh $COMMAND is not supported in this repo." >&2
    echo "Use ./scripts/rebuild.sh backend to build and run the backend service under docker compose." >&2
    exit 1
    ;;
esac

DOCKER_ARGS=(
  --rm
  --user "$(id -u):$(id -g)"
  -e HOME=/tmp
  -e CARGO_HOME=/cargo-home
  -e CARGO_TARGET_DIR=/cargo-target
  -v "$ROOT_DIR/backend:/app"
  -v "$CARGO_CACHE_DIR:/cargo-home"
  -v "$CARGO_TARGET_DIR:/cargo-target"
  -w /app
  --network gbandit-net
  -e DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@${GAME_SLUG}-db:5432/${PGDATABASE}?sslmode=disable"
)

run_backend_container() {
  docker run "${DOCKER_ARGS[@]}" "$BACKEND_IMAGE" "$@"
}

run_backend_container /usr/local/cargo/bin/sqlx migrate run --source ./migrations
run_backend_container /usr/local/cargo/bin/cargo "$@"
