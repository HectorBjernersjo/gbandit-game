## Running the project
The project is already running you can find it on the following urls:
Frontend: http://${GAME_SLUG}.dev.localhost:${INFRA_PORT}
Backend (Rust): http://${GAME_SLUG}.dev.localhost:${INFRA_PORT}/api (via gateway)
Database (PostgreSQL): localhost:${DB_PORT}

Everything runs in docker. There is no hot reload — after making changes, rebuild with the scripts below.
Never use raw bun, cargo, or docker compose commands directly. Always use the provided scripts.

## Commands
To rebuild and restart a service:
```bash
./scripts/rebuild.sh backend # also runs migrations
./scripts/rebuild.sh frontend
```

To run cargo commands (runs migrations first):
```bash
./scripts/cargo.sh test              # run all tests
./scripts/cargo.sh test test_name    # run a specific test
./scripts/cargo.sh add some-crate    # add a dependency
```

To run bun commands:
```bash
./scripts/bun.sh add some-package    # add a dependency
./scripts/bun.sh remove some-package # remove a dependency
```

For docker compose commands (logs, ps, etc.):
```bash
./scripts/dc.sh logs --timestamps
./scripts/dc.sh logs backend --timestamps
./scripts/dc.sh logs frontend --timestamps
./scripts/dc.sh ps
```

If you need to restart the game from scratch:
```bash
./scripts/init.sh
```

To run queries directly on the db:
```
./scripts/psql.sh -c "{ for example select * from users }"
```

## Testing authenticated endpoints
- You can sign in to the frontend with ai@kognito.se / TjabbaTjena999!
- In dev, you can skip the full OAuth flow and test backend endpoints directly with curl using the `X-Auth-Dev` header.
  Pass a user ID (integer) and you'll be authenticated as that user:
  ```bash
  curl -H "X-Auth-Dev: 2" http://${GAME_SLUG}.dev.localhost:${INFRA_PORT}/api/me
  ```
- User ID 2 is ai@kognito.se

## Good to know
- User identity is owned by the auth service (infra repo). Game backends receive a user_id from the gateway via `X-Kognito-*` headers and never manage users directly.
- When investigating an issue, it can be a good idea to add console logs to identify the problem

## Rules
- Always use neverthrow to handle errors, never let the code throw, wrap functions that can throw like fetch, still do console.error to log errors.
- When encountering an issue, focus on addressing the root cause rather than treating the symptoms.
    - It's acceptable—and often preferable—to make a larger refactor instead of applying a quick fix, as you are responsible for the long-term maintainability of the codebase.
    - If the problem arises because another part of the system behaves differently than expected when you try to use it, treat this as a potential sign of poor design, unclear contracts, or missing abstractions, and consider whether that part should be refactored or reworked.
- When you find something that should be fixed, wether that is a bug, some technical debt, a warning, or just something that could make development easier:
    - If it's small or hindering your current task, just fix it immediately
    - Otherwise add it to tasks/TODO.md

## Plan Mode
- Make the plan very concise. Sacrifice grammar for the sake of concision.
- Never include code in the plan.
- When dividing a task (or multiple tasks), do it vertically instead of horizontally.
  Make sure that each subtask can stand "on it's own" as a pr/user story.
