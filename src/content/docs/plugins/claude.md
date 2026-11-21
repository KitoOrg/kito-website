---
title: Claude Code
description: Claude Code set up to work through Kito, by a plugin that also takes it out again.
---

`kito-claude` sets [Claude Code](https://claude.com/claude-code) up to work
through Kito: its rules, Kito's tools, and the hooks that hold it to the
rules. Kito sets Claude Code up itself as well, with `kito claude`, and the
plugin writes the same things. What the plugin adds is the way out, and
that Claude Code is then one assistant among the others.

## Who enables it, and where

A repository, by whoever works in it:

```bash
kito plugin add claude
cd your-repository
kito plugin enable claude
kito assistant add claude
```

```text
Claude Code is set up for Kito in this repository:
  wrote CLAUDE.md
  wrote .mcp.json
  wrote .claude/settings.json
```

## What it asks for

```toml
permissions = ["read"]
```

Only `read`. The plugin asks the daemon nothing: the hooks it writes are
Kito's own commands, run by Claude Code as the person who runs it.

## Using it

`kito assistant add claude` writes three files:

- **`CLAUDE.md`**: the rules of a project kept by Kito (work in a lane,
  change what the lane declared, know why code is the way it is), after
  whatever the project says there itself.
- **`.mcp.json`**: Kito's tools, the server `kito` running `kito-mcp`.
- **`.claude/settings.json`**: the permission to use those tools
  (`mcp__kito__*`), and what Claude Code runs whatever the model decided:
  `kito hook before-edit` before an edit, `kito hook after-shell` after a
  shell command, `kito hook session-start` when a session starts.

What is there already stays: other servers, other permissions, other hooks,
the project's own instructions. A server called `kito` that is not Kito's
is neither replaced nor taken out.

`kito assistant remove claude` takes exactly that out again. Claude Code is
then one assistant among the others (`kito assistant list`).

Kito sets Claude Code up itself, when a repository is made and with
`kito claude` (see [With Claude Code](../../getting-started/claude-code/)).
The plugin writes the same things in the same words: the rules are Kito's
own text. A project set up by one is set up for the other.

## Limits

- `kito` and `kito-mcp` must be on the PATH Claude Code runs with.
- Rules that an older Kito wrote are brought up to date by `kito claude`,
  which knows them; the plugin only sees that rules are there.

## Version

0.1.1
