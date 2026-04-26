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

This project uses Bearer JWTs in the `Authorization` header for HTTP. Browsers cannot set custom headers on the `WebSocket` constructor, so the token is passed via the `Sec-WebSocket-Protocol` subprotocol header instead.

Flow:
1. Frontend opens `new WebSocket(url, ["bearer", token])`. The token is the same one used by the HTTP client (`withBearer` in `frontend/src/lib/http.ts`).
2. Browser sends `Sec-WebSocket-Protocol: bearer, <token>` on the upgrade request.
3. Backend extracts the token from that header, verifies it with `AppState.auth_verifier` (same JWKS verification as `AuthenticatedUser`), and **must echo back the chosen subprotocol** (`"bearer"`) in the upgrade response — otherwise the browser closes the connection.
4. On verification failure, reject the upgrade with 401 before accepting.
5. Build an `AuthenticatedUser` from the verified claims and pass it into the connection task — do not re-extract per message.

Dev bypass: in debug builds, also accept `Sec-WebSocket-Protocol: dev-user, <name>` where `<name>` is `eric`, `anna`, or `steve` (mirrors the `X-Dev-User` HTTP bypass in `backend/src/auth.rs`). This lets `websocat` test the WS without a real JWT.

## Required Module Shape

Backend:
1. `backend/src/ws/messages.rs`: wire protocol (`ClientMsg`, `ServerMsg`)
2. `backend/src/ws/state.rs`: `ClientRegistry` (connected user -> sender)
3. `backend/src/ws/auth.rs`: subprotocol-based token extraction + JWKS verification, returns `AuthenticatedUser`
4. `backend/src/ws/handler.rs`: upgrade handler + reader/writer loop
5. Register `.route("/api/ws", get(ws::handler::ws_handler))`
6. Add `clients: ClientRegistry` to `AppState`

Frontend:
1. Shared `WebSocketProvider` for one app-level connection
2. Provider mounted high enough in router to cover all real-time routes
3. Provider reads the current token from the auth context and passes it as the `bearer` subprotocol on connect/reconnect
4. Consumer API exposes `send`, `connected`, `subscribe`

## Required Invariants

1. Trust boundary: treat `ClientMsg` as untrusted; never trust client-provided identity.
2. Identity authority: server derives identity from the verified JWT and injects it into internal commands.
3. Reject the upgrade on auth failure — never accept then close, that wastes a connection slot and complicates the state machine.
4. One connection per user: reconnect should replace the prior sender/connection.
5. Split socket into reader and writer tasks; writer drains outbound channel only.
6. Backpressure safety: bounded outbound channels; do not allow one slow client to block others.
7. Input hardening: enforce max inbound message size and return structured errors for bad JSON.
8. Cleanup correctness: on disconnect remove client from registry and stop writer task.
9. Registry locking: keep critical sections short and synchronous; do not hold locks across `.await`.

## Protocol Guidance

1. Use tagged JSON messages with stable `type` values.
2. Keep message contracts forward-compatible: additive fields, explicit error events.
3. Multiplex domains by message type prefix (`lobby.*`, `game.*`, etc.) over the same WS.

## Frontend Lifecycle Rules

1. Auto-reconnect with bounded backoff.
2. On reconnect, re-read the token from auth context — it may have been refreshed.
3. Re-subscribe listeners after reconnect (provider-level pub/sub handles this).
4. Only send when socket is open.
5. Parse defensively; malformed server payloads must not crash UI.

## Testing in Dev

Browsers: must be logged in (token in auth context); the provider passes it as the `bearer` subprotocol automatically.

CLI with `websocat`:
```
websocat -H 'Sec-WebSocket-Protocol: dev-user, eric' ws://.../api/ws
```
The HTTP `X-Dev-User` bypass does **not** apply here — use the `dev-user` subprotocol in debug builds instead.
