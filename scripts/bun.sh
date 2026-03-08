#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

docker run --rm -v "$ROOT_DIR/frontend:/app" -w /app oven/bun:1 bun "$@"
