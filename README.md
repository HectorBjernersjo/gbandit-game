# Basegame

A game built on the gbandit platform. Rust/Axum backend, React/Vite frontend, PostgreSQL database.

## Prerequisites

- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/)
- [sqlx-cli](https://github.com/launchbadge/sqlx/tree/main/sqlx-cli) (`cargo install sqlx-cli --no-default-features --features postgres`)
- The [infra stack](../infra/) must be running first (`../infra/scripts/init.sh`)

## Quick Start

```bash
# Start backend (runs migrations automatically)
cd backend
cargo run

# Start frontend (in another terminal)
cd frontend
bun install
bun dev
```

The game is accessible at the URL routed through the infra gateway.

## Architecture

- This is a **game repo**. It depends on the shared infra (auth, gateway) running separately.
- The gateway routes `{slug}.gbandit.localhost` to this game's backend/frontend.
- The browser keeps a shared auth session. The frontend mints short-lived JWTs from the auth service, and the backend validates bearer tokens against the auth JWKS.

## Creating a Migration

```bash
cd backend
sqlx migrate add -r your_migration_name
# Edit the generated files in migrations/
```

Migrations run automatically on backend startup.
