---
name: websocket-setup
description: Set up websocket functionality for the first time.
---

# WebSocket Infrastructure

Use this skill when implementing any real-time feature for the first time: multiplayer, live updates, chat, game state sync.

## Architecture

Single `GET /api/ws` endpoint per client.
Multiplex all real-time domains (lobby, game, highscores, etc.) over message types on this one connection.
Do not create separate WebSocket endpoints per feature.

### How auth works

The gateway handles authentication automatically:
1. Browser opens WebSocket to `/api/ws` — session cookie sent automatically
2. Gateway validates the JWT from cookie, injects `X-Gbandit-*` identity headers, signs them with Ed25519
3. Game backend receives the upgrade request with identity headers
4. The existing `SessionUser` extractor works on the WS upgrade request — use it directly in the handler signature
5. Gateway tunnels the WebSocket bidirectionally after upgrade

## Required Module Shape

Backend:
1. `backend/src/ws/messages.rs`: wire protocol (`ClientMsg`, `ServerMsg`)
2. `backend/src/ws/state.rs`: `ClientRegistry` (connected user -> sender)
3. `backend/src/ws/handler.rs`: upgrade handler + reader/writer loop
4. Register `.route("/api/ws", get(ws::handler::ws_handler))`
5. Add `clients: ClientRegistry` to `AppState`

Frontend:
1. Shared `WebSocketProvider` for one app-level connection
2. Provider mounted high enough in router to cover all real-time routes
3. Consumer API exposes `send`, `connected`, `subscribe`

## Required Invariants

1. Trust boundary: treat `ClientMsg` as untrusted; never trust client-provided identity.
2. Identity authority: server derives identity from `SessionUser` and injects it into internal commands.
3. One connection per user: reconnect should replace the prior sender/connection.
4. Split socket into reader and writer tasks; writer drains outbound channel only.
5. Backpressure safety: bounded outbound channels; do not allow one slow client to block others.
6. Input hardening: enforce max inbound message size and return structured errors for bad JSON.
7. Cleanup correctness: on disconnect remove client from registry and stop writer task.
8. Registry locking: keep critical sections short and synchronous; do not hold locks across `.await`.

## Protocol Guidance

1. Use tagged JSON messages with stable `type` values.
2. Keep message contracts forward-compatible: additive fields, explicit error events.
3. Multiplex domains by message type prefix (`lobby.*`, `game.*`, etc.) over the same WS.

## Frontend Lifecycle Rules

1. Auto-reconnect with bounded backoff.
2. Re-subscribe listeners after reconnect (provider-level pub/sub handles this).
3. Only send when socket is open.
4. Parse defensively; malformed server payloads must not crash UI.

## Testing in Dev

The `X-Auth-Dev` header bypass does NOT work for WebSocket because browsers can't set custom headers on the WebSocket constructor. You must be logged in (have a session cookie). For CLI testing with `websocat`, pass the session cookie manually.
