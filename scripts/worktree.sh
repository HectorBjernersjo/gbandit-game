#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  echo "Usage: $0 <branch-name>"
  echo
  echo "Creates a new git worktree next to the current project directory"
  echo "and runs init.sh to start the game stack for it."
  echo
  echo "The worktree is created at: $(dirname "$ROOT_DIR")/<branch-name>"
  echo "Game will be accessible at: http://<branch-name>.dev.localhost:$INFRA_PORT"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

BRANCH="$1"
PARENT_DIR="$(dirname "$ROOT_DIR")"
WORKTREE_DIR="$PARENT_DIR/$BRANCH"

if [ -d "$WORKTREE_DIR" ]; then
  echo "Error: Directory already exists: $WORKTREE_DIR"
  exit 1
fi

# Create branch if it doesn't exist yet
if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "=== Using existing branch: $BRANCH ==="
else
  echo "=== Creating new branch: $BRANCH (from current HEAD) ==="
  git -C "$ROOT_DIR" branch "$BRANCH"
fi

echo "=== Creating worktree at $WORKTREE_DIR ==="
git -C "$ROOT_DIR" worktree add "$WORKTREE_DIR" "$BRANCH"
echo

echo "=== Running init.sh for new worktree ==="
"$WORKTREE_DIR/scripts/init.sh"
