# Basegame

A game built on the gbandit platform. Rust/Axum backend, React/Vite frontend, PostgreSQL database. The entire dev stack runs in Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (with Compose V2)
- The [infra stack](../infra/) must be running first (`../infra/scripts/init.sh`)

## Quick Start

```bash
./scripts/init.sh
```

The game is accessible at http://default.dev.localhost:80 (routed through the infra gateway).

## Scripts

| Script | What it does |
|---|---|
| `./scripts/init.sh` | Start the full stack (db, backend, frontend, seed) |
| `./scripts/rebuild.sh backend` | Rebuild and restart the backend |
| `./scripts/rebuild.sh frontend` | Rebuild and restart the frontend |
| `./scripts/dc.sh logs --timestamps` | View logs |
| `./scripts/psql.sh` | Open a psql shell to the database |
| `railway up -s <service> --path-as-root <path>` | Deploy to Railway (see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)) |

## Architecture

- This is a **game repo**. It depends on the shared infra (auth, gateway, me) running separately.
- The gateway routes `{slug}.dev.localhost` to this game's backend/frontend via Docker DNS on the shared `kognito-net` network.
- Auth is handled by the infra gateway — backends receive user identity via signed `X-Kognito-*` headers. Games never manage users directly.
- There is no hot reload — after making changes, rebuild with `./scripts/rebuild.sh`.

## Creating a Migration

```bash
cd backend
sqlx migrate add -r your_migration_name
# Edit the generated files in migrations/
```

Then rebuild the backend — migrations run automatically on startup.

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
