## Running the project

Frontend: http://GAME_SLUG.gbandit.com
Backend: http://GAME_SLUG.gbandit.com/api

## Building and deploying

Never build or bundle the project locally using commands like `cargo build` or `bun run dev`. All building and deploying is handled remotely by the gbandit platform.

Always use the `gbandit` CLI to build and deploy:
```bash
gbandit deploy [frontend|backend]
```

Other useful CLI commands:
```bash
gbandit logs [frontend|backend]
gbandit sql "SELECT ..."
gbandit env [set|list|delete]
```

The gbandit cli by default targets the dev environment, if you want to target stage or prod, use --environment [stage|prod]

## Migrations
Migrations are applied automatically when deploying the backend.
DATABASE_URL is provided when building so you don't need to worry about sqlx in any way.

## Testing authenticated endpoints
- You can sign in to the frontend with ai@gbandit.se / TjabbaTjena999!
- In debug builds, send `X-Dev-User: eric` (or `anna`/`steve`) as a header to bypass auth.

## Rules
- When investigating an issue, it is often a good idea to add console logs to identify the problem.
- Only use try catch when you explicity expect there to be an error and you want to handle it. Never to "prevent bugs".
- When encountering an issue, focus on addressing the root cause rather than treating the symptoms.
    - It's acceptable—and often preferable—to make a larger refactor instead of applying a quick fix, as you are responsible for the long-term maintainability of the codebase.
    - If the problem arises because another part of the system behaves differently than expected when you try to use it, treat this as a potential sign of poor design, unclear contracts, or missing abstractions, and consider whether that part should be refactored or reworked.
- When you find something that should be fixed, wether that is a bug, some technical debt, a warning, or just something that could make development easier:
    - If it's small or hindering your current task, just fix it immediately
    - Otherwise add it to TODO.md

## Plan Mode
- Make the plan very concise. Sacrifice grammar for the sake of concision.
- Never include code in the plan.
- When dividing a task (or multiple tasks), do it vertically instead of horizontally.
  Make sure that each subtask can stand "on it's own" as a pr/user story.
