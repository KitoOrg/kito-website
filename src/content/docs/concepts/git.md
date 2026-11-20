---
title: Git, both ways
description: Every checkpoint is a git commit, and commits made with plain git come back in.
---

Kito is its own version control system: it keeps every save, the lanes, the
reasons and the conflicts in `.kito/`. Git sees a lossy but complete copy of
the main lane's history.

## Out to git

Every checkpoint of the main lane is exported as a git commit, on the branch
HEAD is on (or `[git] branch`). GitHub, code review and CI keep working
without knowing Kito is there. `.kito/` is in `.gitignore`.

Kito can push every integration to a remote, without ever forcing:

```toml
[git]
push = "origin"
```

## In from git

An existing git repository becomes a Kito repository with its history:

```bash
kito import
```

People who do not use Kito keep committing with plain git and pushing to the
remote. Before it pushes, Kito fetches what the remote has: those commits
come in through a lane, are merged function by function with what the agents
did meanwhile, checked, and pushed back as a git merge. Each commit keeps
its author, and its message becomes the reason of its changes.

A commit that conflicts waits in its lane for a decision, and the push waits
with it:

```bash
kito status
kito conflicts
kito pull
```
