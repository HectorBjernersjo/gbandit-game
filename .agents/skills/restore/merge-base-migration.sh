#!/usr/bin/env bash
set -euo pipefail

TARGET_SHA="${1:-}"
if [ -z "$TARGET_SHA" ]; then
  echo "usage: $0 <target-sha>" >&2
  exit 2
fi

MERGE_BASE=$(git merge-base HEAD "$TARGET_SHA") || {
  echo "no common ancestor between HEAD and $TARGET_SHA (or unknown sha) — cannot restore" >&2
  exit 1
}

version_at() {
  local commit="$1"
  git ls-tree -r "$commit" --name-only -- backend/migrations/ 2>/dev/null \
    | sed -nE 's|^backend/migrations/([0-9]{14})_.*\.up\.sql$|\1|p' \
    | sort -n \
    | tail -1
}

BASE_VERSION=$(version_at "$MERGE_BASE")
BASE_VERSION="${BASE_VERSION:-0}"

CURRENT_VERSION=$(version_at HEAD)
CURRENT_VERSION="${CURRENT_VERSION:-0}"

echo "merge-base:      $MERGE_BASE"
echo "base-version:    $BASE_VERSION"
echo "current-version: $CURRENT_VERSION"
