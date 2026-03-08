#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Allow anything that goes through our scripts
if echo "$COMMAND" | grep -qP '^\./scripts/'; then
  exit 0
fi

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
}

if echo "$COMMAND" | grep -qP '\bdocker\s+compose\b'; then
  deny "Do not use docker compose directly. Use ./scripts/dc.sh for docker compose commands, or ./scripts/rebuild.sh <service> to rebuild and restart a service."
elif echo "$COMMAND" | grep -qP '\bbun\b'; then
  deny "Do not use raw bun commands. Use ./scripts/bun.sh instead."
elif echo "$COMMAND" | grep -qP '\bcargo\b'; then
  deny "Do not use raw cargo commands. Use ./scripts/cargo.sh instead."
else
  exit 0
fi
