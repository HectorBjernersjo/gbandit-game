#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE="${1:?Usage: rebuild.sh <service|--all>}"
DC="docker compose -p $GAME_PROJECT -f $ROOT_DIR/docker-compose.yml"

build_service() {
  local svc="$1"
  echo "=== Building $svc ==="
  if ! build_output=$($DC build "$svc" 2>&1); then
    echo "$build_output" | grep -E '(error|Error|ERROR|warning|failed|FAILED)' || echo "$build_output" | tail -20
    return 1
  fi
}

start_service() {
  local svc="$1"
  echo "=== Starting $svc ==="
  if ! $DC up --wait --force-recreate --no-deps -d "$svc" 2>&1 | tail -5; then
    on_fail "$GAME_PROJECT" "$ROOT_DIR/docker-compose.yml" "$svc"
    return 1
  fi
  echo "=== $svc logs ==="
  $DC logs "$svc" --timestamps --tail 5
}

if [ "$SERVICE" = "--all" ]; then
  # Build in parallel
  tmpdir=$(mktemp -d)
  for svc in frontend backend; do
    build_service "$svc" > "$tmpdir/$svc.log" 2>&1 &
  done

  failed=0
  for job in $(jobs -p); do
    if ! wait "$job"; then failed=1; fi
  done
  cat "$tmpdir/frontend.log" "$tmpdir/backend.log"
  rm -rf "$tmpdir"
  [ "$failed" -eq 0 ] || exit 1

  # Start sequentially to avoid docker conflicts
  for svc in frontend backend; do
    start_service "$svc" || exit 1
  done
else
  build_service "$SERVICE" || exit 1
  start_service "$SERVICE" || exit 1
fi
