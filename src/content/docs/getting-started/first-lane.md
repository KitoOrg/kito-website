---
title: A first lane
description: Open a lane for an agent, let it work, and integrate its work.
---

Every agent works in a **lane**: a working copy of its own, where its saves
are recorded like yours. A lane is opened by saying why (the intent) and what
it will change (the scope):

```bash
kito lane open alice --intent "taxes on every total" --scope src/shop.ts:total
```

```text
lane/1 opened for alice on ckpt#1.
Working copy: /home/ada/shop/.kito/lanes/1/work
Scope: src/shop.ts:total
```

The agent edits the files in that working copy, and only there.

## Integrate

When the work is done, it is composed with what the main lane has become
meanwhile, function by function:

```bash
kito integrate lane/1
```

```text
lane/1: integrated as ckpt#2 (git 78ff4e73aa)
```

The main lane now has the work, under a new checkpoint that is also a git
commit, and the lane has been brought up to it. Close it when it is done for
good:

```bash
kito lane close lane/1
```

## Checks

Commands that must pass before anything reaches the main lane go in
`.kito/config.toml`. They run on a copy of the merged result:

```toml
[verify]
commands = ["npx tsc --noEmit", "npm test"]
```

## Conflicts

A real conflict (the same lines of the same function, or a function removed
on one side and changed on the other) stops that lane only:

```bash
kito conflicts
```

Decide each by taking a side, or by writing the text, then integrate again:

```bash
kito resolve conflict#1 --lane
```

## Who is on what

```bash
kito lanes
kito board
```

`kito board` shows what each lane declared and is changing, and which lanes
are on the same code. See [Lanes, intents and scopes](../../concepts/lanes/).
