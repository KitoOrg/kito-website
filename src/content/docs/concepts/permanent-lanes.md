---
title: Permanent lanes
description: A staging lane next to main, with its own checkpoints, git branch and checks.
---

A **permanent lane** is a lane that is never closed: a `staging` next to
`main`, that work lands on before it reaches main, and that CI deploys from.

```bash
kito lane create staging
kito lane open alice --intent "users have a team" --scope src/api.py --on staging
```

Landing on a permanent lane makes a checkpoint of it, runs its checks, and
exports the checkpoint to a git branch of its own, `staging`, pushed with
main's:

```text
lane/2: landed on staging as ckpt#2 (git 07b67ccad5), verified in 0.3 s
```

## Catching up

What lands on main directly comes into staging as a merge:

```bash
kito lane catch-up staging
```

## Landing on main

When staging is good, it lands on main as a git merge of the two branches,
and stays open, brought up to main:

```bash
kito integrate staging
```

```text
*   3ce6813  (HEAD -> main) staging
|\
| *   5e7f5e3  (staging) catch up with main
| |\
| |/
|/|
* | 8335d1d  a readme
| * 41708f7  show the team
| * 07b67cc  users have a team
|/
* fc1d222  an app with an API and a page
```

## Configuration

```toml
[lanes.staging]
verify = ["npm test"]       # its checks, instead of [verify]
branch = "staging"          # its git branch (default: its name)
integrate = ["ci"]          # who may land on it (default: whoever may integrate)
```
