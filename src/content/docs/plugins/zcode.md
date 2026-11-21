---
title: ZCode
description: ZCode set up to work through Kito, with hooks that are a person's own.
---

`kito-zcode` sets [ZCode](https://zcode.z.ai), the coding assistant of
Z.ai, up to work through Kito. It writes the rules and Kito's tools in a
project, and the hooks that hold ZCode to the rules in your own ZCode
settings, since ZCode runs no hooks of a project.

## Who enables it, and where

A repository, by whoever works in it:

```bash
cd your-repository
kito assistant add zcode
```

The same command as for every assistant: it installs this plugin from
the registry when it is not there, enables it here, and runs it, saying
each step.

```text
Set up for ZCode:
  enabled the plugin zcode here: it may read
  ZCode is set up for Kito in this repository:
    wrote AGENTS.md
    wrote .zcode/config.json
    wrote ~/.zcode/cli/config.json: Kito's hooks, for every project you open in ZCode
```

## What it asks for

```toml
permissions = ["read"]
```

Only `read`. The plugin asks the daemon nothing: the hooks are Kito's own
commands, run by ZCode as the person who runs it.

## Using it

`kito assistant add zcode` writes two files in the project:

- **`AGENTS.md`**: the rules of a project kept by Kito (work in a lane,
  change what the lane declared, know why code is the way it is), between
  two marks, after whatever the project says there itself.
  [Codex](../codex/) reads the same file: the rules are written once, and
  stay while either of the two is set up.
- **`.zcode/config.json`**: Kito's tools, `mcp.servers.kito` running
  `kito-mcp`. ZCode connects a project's servers when a session starts.

What is there already stays. A server called `kito` that is not Kito's is
neither replaced nor taken out.

ZCode runs no hooks of a project: only those of your own configuration,
`~/.zcode/cli/config.json`. So what holds ZCode to the rules cannot come
with the repository, and the plugin writes nothing of yours unasked.

- `kito zcode hooks` says whether Kito's hooks are there, and prints them.
- `kito zcode hooks install` adds them: `kito hook before-edit` before
  `Write` and `Edit`, `kito hook after-shell` after `Bash`,
  `kito hook session-start` when a session starts. It turns on
  `hooks.enabled`, without which ZCode runs none: hooks of your own that
  were there run from then on too.
- `kito zcode hooks remove` takes Kito's out and leaves yours.

The hooks run for every project you open in ZCode, and say nothing where
Kito is not. `kito assistant remove zcode` takes out what was written in
the project; `kito zcode hooks remove`, what was written for you.

## Limits, and what was not tried

- Nothing here has been run under ZCode: it is written from its
  documentation (3.18 was current), and follows what that documentation
  says ZCode sends before it writes a file.
- Not confirmed: what ZCode sends for `Edit` (taken to be what Claude Code
  sends, as the rest is), and that it asks nothing before it uses the tools
  of a project's server.
- Until the hooks are installed, the rules of `AGENTS.md` are advice, and
  what holds ZCode to them is Kito itself when a lane is integrated.
- `kito` and `kito-mcp` must be on the PATH ZCode runs with.

## Version

0.2.0
