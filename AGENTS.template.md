## Running the project

Frontend: http://${GAME_SLUG}.gbandit.localhost (via gateway)
Backend: http://${GAME_SLUG}.gbandit.localhost/api (via gateway)
Database: localhost:5432

## Building and deploying

Never build or bundle the project locally using commands like `cargo build` or `bun run dev`. All building and deploying is handled remotely by the gbandit platform.

Always use the `gbandit` CLI to deploy:
```bash
gbandit deploy backend
gbandit deploy frontend
```

Other useful CLI commands:
```bash
gbandit logs backend
gbandit logs frontend
gbandit sql "SELECT ..."
```

## Testing authenticated endpoints
- You can sign in to the frontend with ai@gbandit.se / TjabbaTjena999!

## Good to know
- User identity is owned by the auth service (infra repo). Game backends validate JWT bearer tokens against the auth JWKS and never manage users directly.
- The browser keeps a shared auth session (cookies). The frontend mints short-lived JWTs from the auth service, and the backend validates them.
- When investigating an issue, it can be a good idea to add console logs to identify the problem.

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
