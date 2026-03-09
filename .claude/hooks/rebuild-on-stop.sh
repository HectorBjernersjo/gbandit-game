#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Read JSON from stdin
input=$(cat)

# Skip if this stop was triggered by a previous stop hook
if echo "$input" | grep -q '"stop_hook_active"\s*:\s*true'; then
  exit 0
fi

# Skip if Claude explicitly opted out with [SKIP_REBUILD]
if echo "$input" | grep -q 'SKIP_REBUILD'; then
  exit 0
fi

# Rebuild; if successful, allow stop
output=$("$ROOT_DIR/scripts/rebuild.sh" --all 2>&1) && exit 0

# Build failed — block the stop and tell Claude to fix it
# Trim output to last 80 lines and JSON-escape it
escaped=$(echo "$output" | tail -80 | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')

echo "{\"decision\":\"block\",\"reason\":\"Build failed. Fix the errors and try again. If you cannot fix it or it's intentionally broken, include [SKIP_REBUILD] in your response to stop.\\n\\n${escaped:1:-1}\"}"
exit 0
