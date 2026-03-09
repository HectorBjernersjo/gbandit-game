#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUN_CACHE_DIR="$ROOT_DIR/.cache/bun"
mkdir -p "$BUN_CACHE_DIR"

docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp \
  -v "$ROOT_DIR/frontend:/app" \
  -v "$BUN_CACHE_DIR:/tmp/.bun/install/cache" \
  -w /app \
  oven/bun:1 \
  bun "$@"
