# Basegame

A game built on the gbandit platform. Rust/Axum backend, React/Vite frontend, PostgreSQL database. The entire dev stack runs in Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Compose V2)
- The [infra stack](../infra/) must be running first (`../infra/scripts/init.sh`)

## Quick Start

```bash
./scripts/init.sh
```

The game is accessible at http://default.gbandit.localhost:80 (routed through the infra gateway).
This repo uses a rebuild-and-redeploy workflow in development. After changing code, rebuild the affected service with `./scripts/rebuild.sh backend` or `./scripts/rebuild.sh frontend`.

## Scripts

| Script | What it does |
|---|---|
| `./scripts/init.sh` | Start the full stack (db, backend, frontend, seed) and set up local dev helpers |
| `./scripts/rebuild.sh backend` | Rebuild and restart the backend |
| `./scripts/rebuild.sh frontend` | Rebuild and restart the frontend |
| `./scripts/cargo.sh <args>` | Run one-off Cargo/sqlx tasks inside the backend dev image |
| `./scripts/bun.sh <args>` | Run one-off Bun tasks inside a disposable Bun container |
| `./scripts/dc.sh logs --timestamps` | View logs |
| `./scripts/psql.sh` | Open a psql shell to the database |
| `railway up -s <service> --path-as-root <path>` | Deploy to Railway (see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)) |

## Architecture

- This is a **game repo**. It depends on the shared infra (auth, gateway, me) running separately.
- The gateway routes `{slug}.gbandit.localhost` to this game's backend/frontend via Docker DNS on the shared `gbandit-net` network.
- Auth is handled by the infra gateway — backends receive user identity via signed `X-Gbandit-*` headers. Games never manage users directly.
- There is no hot reload. Source changes do nothing until you rebuild the affected service.
- Long-running app services are managed through Docker Compose via `./scripts/init.sh` and `./scripts/rebuild.sh`. Do not use ad hoc `cargo run` for the backend in this repo.

## Creating a Migration

```bash
cd backend
sqlx migrate add -r your_migration_name
# Edit the generated files in migrations/
```

Then rebuild the backend — migrations run automatically on startup.

## Cargo And Bun Helpers

- `./scripts/cargo.sh ...` runs inside the backend dev image, runs migrations first, and is intended for one-off commands such as `test` and `add`.
- `./scripts/cargo.sh run` is intentionally unsupported. Use `./scripts/rebuild.sh backend` to build and run the backend service.
- `./scripts/bun.sh ...` runs one-off Bun commands in a disposable container for dependency management and similar tasks.

## Notes On `init.sh`

- `./scripts/init.sh` expects the shared infra stack to already be running.
- It also writes `AGENTS.md` and `CLAUDE.md` from `AGENTS.template.md`.
- On local machines it may enable `direnv` and start Chromium remote debugging if available.

## Multiple Workspaces

Each git worktree gets deterministic, unique ports derived from its filesystem path. Just `git worktree add` to another directory and run `./scripts/init.sh` there — no port conflicts.

## Production Deployment

```bash
# One-time setup
npm i -g @railway/cli
railway login
railway link

# Deploy
railway up -s backend --path-as-root backend
railway up -s frontend --path-as-root frontend
```

The backend requires `cargo sqlx prepare` before deploying (generates `.sqlx/` offline query metadata). See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for full setup.
