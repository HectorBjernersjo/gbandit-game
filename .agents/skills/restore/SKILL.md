---
name: restore
description: Restore the dev environment (tenant DB + workspace + running container) to a previous checkpoint commit. Use when the user asks to restore, roll back, or revert dev to a specific commit / checkpoint, e.g. `/skill:restore <commit-sha>`.
---

# Restore dev to a checkpoint

Restore dev to a target commit by rolling the tenant DB back first, then checking out and deploying that commit. If no commit sha was provided, ask which checkpoint and stop.

## Why the DB target is the merge-base migration

Migrate down to the migration version at the merge-base of `HEAD` and the target, not necessarily the target commit itself. `gbandit migrate down-to` uploads the current `backend/migrations/` directory, so only down-migrations that exist at `HEAD` are available. After checkout + deploy, normal sqlx forward migration applies any target-branch migrations.

## Procedure

Resolve the merge-base migration information with the helper next to this skill, replacing `<target-sha>` with the commit the user asked for:

```bash
.agents/skills/restore/merge-base-migration.sh <target-sha>
```

Tell the user the printed merge-base, base-version, and current-version.

If `base-version` differs from `current-version`, migrate down before checkout:

```bash
gbandit migrate down-to <base-version> --message "Restore to <target-sha>"
```

If migrate-down fails, stop. Do not checkout or deploy. Report the CLI error verbatim (notably migration floor violations or a failed down migration).

Protect any dirty workspace, then checkout:

```bash
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "WIP before restore to <target-sha>"
fi

git checkout <target-sha>
```

If checkout fails, stop and report. The DB may already be rolled back and the running container is unchanged; tell the user to fix the workspace issue and retry, or restore the DB by migrating back to the printed `current-version`.

Deploy the checked-out commit:

```bash
gbandit deploy --message "Restore to <target-sha>"
```

If deploy fails, stop and report; the user can usually retry `gbandit deploy` after fixing the issue.

## Reporting

Narrate each step: resolving migration target, migrating down if needed, committing dirty work if needed, checking out, and deploying. On success, end with the target sha and resulting migration version (the printed `base-version`, plus any forward migrations applied by deploy if relevant).
