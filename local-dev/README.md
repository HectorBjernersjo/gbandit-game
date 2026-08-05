# Local development

Run the project on your laptop in Docker — no `gbandit deploy` needed.

The compose stack always runs the backend and a Postgres database locally, even
though deploys are frontend-only until you uncomment `backend` in
`gbandit.jsonc` — so you can develop backend code before opting in.

> **Note for AI agents:** the rule in `AGENTS.md` ("never build, bundle or run tests locally") applies to **you** (Pi Agent and other coding agents). Always use `gbandit deploy`. This `local-dev/` setup is for **human developers** running the stack on their laptop.

## AI agents

If you want an AI agent (Claude, Cursor, etc.) to develop against this local stack instead of `gbandit deploy`, opt in by `@`-referencing [`AGENTS.md`](./AGENTS.md) from your project's root `AGENTS.md` or `CLAUDE.md`. It overrides the platform's "always deploy via gbandit" rule for the duration of the session.

## Run

```bash
cd local-dev
docker compose up
```

Open <http://localhost:5173>.

The frontend (vite dev server) proxies `/api/*` to the backend, so there is one origin and no CORS. HMR is enabled — edit files in `frontend/src/` or `backend/src/` and the running container picks it up.

## Auth

Local dev does **not** talk to `auth.gbandit.com`. Instead, the frontend sends an `X-Dev-User` header which the backend honours in debug builds (see `backend/src/auth.rs`).

A dev-toolbar appears in the bottom-right of the frontend (only when `import.meta.env.DEV`). Pick one of:

- **Logged out** — no header, backend returns 401, you land on `HomeLoggedOut`
- **eric**, **anna**, **steve** — backend treats the request as that user

The choice persists in `localStorage`.

## Database

Postgres runs as a service on `db:5432` inside the compose network (and `localhost:5432` from the host). `DATABASE_URL` is always set in the compose env.

The `game-template` backend ships **DB-less** — `pool` and `database_url` are commented out in `main.rs` / `config.rs`. Backend ignores the URL until you un-comment them after writing your first migration.

If `backend/migrations/` contains `*.up.sql` files, the backend container runs `sqlx migrate run` before starting the server.

## Useful commands

```bash
./scripts/psql.sh                    # psql shell into the dev DB
docker compose logs -f backend       # tail backend logs
docker compose restart backend       # full restart (rare — cargo-watch usually handles it)
docker compose down -v               # nuke everything including the DB volume
```

## What is *not* here

- No production parity. Tenant routing, real auth, and the real CNPG cluster live in the platform — not here.
- No seed data. Add your own SQL via `./scripts/psql.sh < my-seed.sql` if you need it.
- No tests run automatically. Run `docker compose exec backend cargo test` manually.
