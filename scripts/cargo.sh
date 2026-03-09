#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/env.sh"

CARGO_CACHE_DIR="$ROOT_DIR/.cache/cargo"
CARGO_TARGET_DIR="$ROOT_DIR/.cache/cargo-target"
mkdir -p "$CARGO_CACHE_DIR" "$CARGO_TARGET_DIR"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -e CARGO_HOME=/cargo-home \
  -e CARGO_TARGET_DIR=/cargo-target \
  -v "$ROOT_DIR/backend:/app" \
  -v "$CARGO_CACHE_DIR:/cargo-home" \
  -v "$CARGO_TARGET_DIR:/cargo-target" \
  -w /app \
  --network gbandit-net \
  -e DATABASE_URL="postgres://${PGUSER}:${PGPASSWORD}@${GAME_SLUG}-db:5432/${PGDATABASE}?sslmode=disable" \
  "${GAME_PROJECT}-backend" \
  cargo "$@"
