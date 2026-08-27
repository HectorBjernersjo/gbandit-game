# Local-dev override

> Reference this file from your project's `AGENTS.md` or `CLAUDE.md` (e.g. `@local-dev/AGENTS.md`) to switch the AI agent into local-development mode.

## Override of the parent AGENTS.md

The parent `AGENTS.md` instructs you to deploy via `gbandit deploy` and never build/test locally. **When this file is in scope, those rules do not apply.** You are running against the local Docker stack in `local-dev/docker-compose.yml`. There is no `gbandit deploy`. There is no pipeline. Code changes hit the running containers directly.

## How code changes reach the running stack

- **Frontend (`frontend/`)** — vite HMR. Edit a `.tsx`/`.ts` and the browser updates in ~1s. No restart.
- **Backend (`backend/`)** — `cargo watch` recompiles and restarts on `.rs` changes. Watch with `docker compose -f local-dev/docker-compose.yml logs -f backend`.
- **Migrations** — a new `NNNN_foo.sql` triggers a rebuild (`backend/build.rs` tells cargo the directory is an input) and the app applies it on the next boot. `docker compose -f local-dev/docker-compose.yml restart backend` forces it.
- **Compose / Dockerfile.dev changes** — `docker compose -f local-dev/docker-compose.yml up -d --build`.

## Auth

- The `X-Dev-User` header bypasses JWT verification when `GBANDIT_ENVIRONMENT=dev`. Valid values: `eric`, `anna`, `steve`. Omit the header to test the unauthenticated path.
- Do not use `auth.gbandit.com` URLs in local mode — they cannot reach a session cookie scoped to `localhost`.
- The frontend dev-toolbar (bottom-right) sets the chosen user in `localStorage`; subsequent fetches add the header automatically.

## Verifying a change

Replace `gbandit deploy` with direct verification:

```bash
# Backend route works for an authenticated user:
curl -s -H "X-Dev-User: eric" http://localhost:5173/api/me

# Frontend renders without runtime errors:
docker compose -f local-dev/docker-compose.yml logs --tail=30 frontend

# Backend compiled cleanly after your edit:
docker compose -f local-dev/docker-compose.yml logs --tail=30 backend
```

If you need to run tests:

```bash
docker compose -f local-dev/docker-compose.yml exec backend cargo test
```

## Useful commands

```bash
docker compose -f local-dev/docker-compose.yml logs -f <service>
docker compose -f local-dev/docker-compose.yml restart backend
docker compose -f local-dev/docker-compose.yml exec backend sqlite3 /data/db.sqlite
docker compose -f local-dev/docker-compose.yml down       # stop
docker compose -f local-dev/docker-compose.yml down -v    # stop + wipe DB
```

## Rules that still apply from the parent AGENTS.md

- Root-cause fixes over symptom-patching.
- Add to `TODO.md` if a fix is out of scope for the current task.
- No `try/catch` for "preventing bugs".
