---
name: pull-and-merge
description: Pull the latest commits from the remote and merge them
disable-model-invocation: true
---

Run git pull --rebase. If there are no conflicts, great - you are done!
If there are conflicts, go through them and solve any that are trivial.
If there are conflicts where you genuinely don't know what to do (like two different features conflicting), ask the user what they want to do.
After solving all the conflicts do git -c core.editor=true rebase --continue. If there are more conflicts keep solving them the same way until you are done.
