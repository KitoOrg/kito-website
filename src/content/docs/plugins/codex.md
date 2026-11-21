---
title: Codex
description: Codex set up to work through Kito, with every patch asked about before it is applied.
---

`kito-codex` sets [Codex](https://github.com/openai/codex), the coding
assistant, up to work through Kito. It writes what Codex reads in a
project, and answers Codex before it changes files.

## Who enables it, and where

A repository, by whoever works in it:

```bash
cd your-repository
kito assistant add codex
```

The same command as for every assistant: it installs this plugin from
the registry when it is not there, enables it here, and runs it, saying
each step.

```text
Codex is set up for Kito in this repository:
  wrote AGENTS.md
  wrote .codex/config.toml
  wrote .codex/hooks.json
```

Codex then asks two things of you. It reads a project's `.codex/` only once
you trust the project, and runs a project's hooks only once you have
reviewed them (`/hooks`). Until then the rules of `AGENTS.md` are advice,
and nothing holds Codex to them but Kito itself, when the lane is
integrated.

## What it asks for

```toml
permissions = ["read"]
```

Only `read`. The plugin asks the daemon nothing itself: what Codex is about
to edit is asked through `kito hook before-edit`, as the person who runs
Codex.

## Using it

`kito assistant add codex` writes three files:

- **`AGENTS.md`**: the rules of a project kept by Kito (work in a lane,
  change what the lane declared, know why code is the way it is), between
  two marks, after whatever the project says there itself.
- **`.codex/config.toml`**: Kito's tools, `[mcp_servers.kito]` running
  `kito-mcp`, asked for without a prompt each time.
- **`.codex/hooks.json`**: what Codex runs whatever the model decided.

The hooks:

- Before a patch, `kito codex hook before-edit`. A patch that edits the
  main directory, Kito's own files or something the lane did not declare is
  refused, with what to do instead. One on lines written for a reason the
  lane was not told is held back once, with the reasons.
- After a shell command, `kito hook after-shell`: what the command changed
  where it should not have.
- When a session starts, `kito hook session-start`: the rules, and who is
  working on what.

What is there already stays: other servers, other hooks, the project's own
instructions. A server called `kito` that is not Kito's is neither replaced
nor taken out. `kito assistant remove codex` takes exactly that out again.

Codex changes files with one tool, `apply_patch`, whose patch names no
line: a change is found by the lines around it. The plugin finds them the
same way in the file as it is now, and asks Kito about every file of the
patch. One refusal refuses the patch: Codex applies all of it or none. A
change that cannot be placed, and a file added, deleted or moved to, is
asked about whole.

With each question Kito is told that Codex asks, and the model Codex gave
the hook: from Kito 0.25 the lane says which assistant works in it
(`kito lanes`, `kito board`). An older Kito is asked as before.

## Limits, and what was not tried

- `kito` and `kito-mcp` must be on the PATH Codex runs with.
- What a shell command changes is not a patch, and is seen only after it
  ran.
- Tried with Codex 0.171 itself, nobody signed in: in a project that is
  trusted it reads `.codex/config.toml` and starts `kito-mcp`, and the
  rules of `AGENTS.md` and Kito's tools are in what the model is given.
- Not tried, since it takes a session with a model: Codex running the
  hooks. They follow what the Codex documentation says Codex sends before
  a patch.
- Not confirmed: which name its shell tool is matched by (it is
  `exec_command` to the model and `Bash` in the documentation: the hook
  names both), and whether it shows the model what the hooks after a
  command and at the start of a session answer.

## Version

0.1.4
