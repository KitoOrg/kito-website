---
title: Lanes, intents and scopes
description: How agents work side by side, each saying why and what before it changes anything.
---

A **lane** is a line of work: a working copy of its own
(`.kito/lanes/<id>/work`), whose saves are recorded under its own ID. What a
lane holds is the state it started from plus its own changes; both can always
be rebuilt from the log. The **main lane** is the project's directory itself.

## Intent and scope

No lane opens without an **intent** (one sentence: why) and a **scope**
(what it will change):

- functions and classes, as `file:name` (`src/shop.ts:total`), also ones
  that do not exist yet;
- files (`src/shop.ts`);
- directories (`src/billing/`), the files to come included.

A scope only grows:

```bash
kito lane scope lane/1 --add README.md
```

What a lane changes is compared with what it declared. A change outside the
scope is recorded like any other, and stops the lane at integration until
the scope is extended to it or the change is undone. A rename and the
callers that take the new name are not outside, nor is an import next to a
declared function, nor the files every lane may change:

```toml
[scope]
always_allowed = ["package-lock.json"]
broad_files = 200      # a scope over more files than this is shown as broad
broad = "warn"         # or "refuse"
```

## The intent board

Two lanes may be on the same code: both are told, once, with what the other
is there for. Overlaps are found in what was declared and in what was
changed, on three levels: the same function, the same file, and a function
of one lane that uses a function of the other. The second agent hears of it
when it declares its scope, before it writes a line.

```bash
kito board
```

A lane is also told when the main lane changes something it declared after
it started, with who changed it and what for.

## Integration

`kito integrate` composes a lane's work with the main lane as it is now
([function by function](../merging/)), runs the checks on the
result, and records it under a checkpoint signed by the agent. Lanes that
ask at the same time and do not touch the same files are checked together,
in one run of the checks.

Lanes can also start on another lane before it lands: see
[Lanes on lanes](../lanes-on-lanes/).
