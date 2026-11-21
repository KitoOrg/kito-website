---
title: What your agents are told
description: Instructions for coding assistants, kept by Kito and shared with the whole team, never in the repository.
---

Every coding assistant reads its instructions from a file in the project:
`CLAUDE.md` for Claude Code, `AGENTS.md` for Codex and ZCode. Kept by hand,
those files drift apart from one person to the next, end up in the
history, and get merge conflicts like code.

With Kito they are not part of the repository. What your agents are told
is kept by Kito, shared with everyone who works in the repository (through
its server, when it has one), and written into those files at the start
of every session.

## One standard

An instruction is a markdown file in one of two kinds of folder:

```text
all/style.md        every assistant
claude/brief.md     Claude Code only
codex/plans.md      Codex only
zcode/…             ZCode only
```

Each assistant gets Kito's rules first (work in a lane, change what the
lane declared, know why before you change), then everything in `all/`,
then its own folder.

## A kitchen first, the repository over it

A **kitchen** is what a team shares across its repositories. Its
instructions live in its `instructions/` folder, in the same layout.
Attach one to a repository, and its agents get the kitchen's
instructions before the repository's own. Where both have a file of the
same name, the repository's wins; an empty one takes the kitchen's away.

```bash
kito instructions kitchen ../kitchen         # a directory on your machine
kito-server repo set shop --kitchen kitchen  # on a server: another of its repositories
```

A repository with no kitchen has the standard one: Kito's rules alone.

## Day to day

```bash
kito instructions                        # what is told, and where each part comes from
kito instructions show --for codex       # AGENTS.md as Codex gets it
kito instructions set style --file style.md
kito instructions set claude/brief       # from the standard input
kito instructions remove style
```

```text
Kitchen: ../kitchen
Every assistant is told Kito's rules first, then:
  all/money.md             the kitchen: Money
  all/style.md             this repository, over the kitchen's: Style
  codex/plans.md           the kitchen: Plans
```

In a directory connected to a server, the instructions are the server's:
anyone who may write in the repository can change them, anyone who may
read it is told them, and everyone gets the change at their next session.

## Out of the repository

The files assistants read are kept out of Kito's history and out of git:
`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.mcp.json`, `.claude/`, `.codex/`,
`.zcode/`, `.cursor/` and the like. `.gitignore` names them for whoever
uses git by hand. A clone gets them with `kito assistant add <name>`.

Kito writes its part of each file between two marks. A project that
already had a `CLAUDE.md` or an `AGENTS.md` keeps what it said: the first
time Kito writes the file, that text becomes an instruction of the
repository, shared from then on. Lines you add outside the marks stay on
your machine only.

To record those files in the history again, as any other:

```toml
# .kito/config.toml
[agents]
files_in_history = true
```
