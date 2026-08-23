## The gbandit cli

Always use the `gbandit` CLI to build and deploy:
```bash
gbandit deploy --message "<what you just changed>"
```

If no account is logged in yet and the project is frontend-only, create a
guest account first with `gbandit login --guest` (no browser needed). A Google
account (`gbandit login`) is only required for backend/database deploys and
can be linked later — the guest's username and projects are kept.

Other useful CLI commands:
```bash
gbandit logs [frontend|backend]
gbandit sql "SELECT ..."
gbandit env [set|list|delete]
gbandit --help
```

For more information about the platform, the cli, the config or anything else gbandit related, use the `gbandit docs` command.

The gbandit cli by default targets the dev environment, if you want to target prod, use --environment prod

## Testing authenticated endpoints
- In the dev environment, send `X-Dev-User: eric` (`anna` and `steve` also work) as a header to bypass auth when testing backend endpoints.

## Rules
- Never build, bundle or run tests in the project locally using commands like `cargo build` or `bun run dev`. All building and deploying is handled remotely by the gbandit platform.

## General guidelines
- When investigating an issue, it is often a good idea to add logs to identify the problem.
- Only use try catch when you explicity expect there to be an error and you want to handle it. Never use it to "prevent bugs".
- When encountering an issue, focus on addressing the root cause rather than treating the symptoms.
    - It's acceptable—and often preferable—to make a larger refactor instead of applying a quick fix, as you are responsible for the long-term maintainability of the codebase.
    - If the problem arises because another part of the system behaves differently than expected when you try to use it, treat this as a potential sign of poor design, unclear contracts, or missing abstractions, and consider whether that part should be refactored or reworked.
- When you find something that should be fixed, wether that is a bug, some technical debt, a warning, or just something that could make development easier:
    - If it's small or hindering your current task, just fix it immediately
    - Otherwise add it to TODO.md
- Always deploy after making changes so the user can test them.
