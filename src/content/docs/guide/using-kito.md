---
title: Using Kito, day to day
description: From an empty directory to a team on a server, with the commands that matter at each step.
---

This page goes through Kito in the order a project meets it. Each section
has the commands that matter, and a link to the page that says more.

## Install and start a repository

Kito is four programs: `kito`, `kitod`, `kito-mcp` and `kito-server`.
[Install](../../install/) says how to get them onto your `PATH`. Then:

```bash
kito init      # in a new directory
kito import    # in an existing git repository: its history comes in
```

From here on every save is recorded, with no commits to make. `kito log`
shows what happened. See [First steps](../../getting-started/first-steps/).

## Set an assistant up

Every assistant is set up with the same command. For Claude Code, Kito
writes the MCP server, the hooks that hold it to the rules, and the rules
in `CLAUDE.md` ([With Claude Code](../../getting-started/claude-code/));
for Codex and ZCode, their [plugin](../../plugins/) does, fetched and
enabled for you:

```bash
kito assistant add claude codex
kito assistant default claude codex   # what every new project gets
```

`kito init` and `kito import` set up the ones you said, or ask at the
terminal for the ones found on your machine. Any agent that speaks MCP
can use `kito-mcp` as it is.

## A lane for each piece of work

Each piece of work gets a lane: a working copy of its own, opened by saying
why (the intent) and what it will change (the scope). An agent opens its
lane with the `open_lane` tool. A person does it from the command line:

```bash
kito lane open alice --intent "taxes on every total" --scope src/shop.ts:total
```

The answer names the working copy, the lanes that are on the same code, and
the reasons the declared code is the way it is. The agent edits the files
there and nowhere else. A scope only grows: `kito lane scope lane/1 --add README.md`.

A lane also says which assistant works in it, and on what model when that
is known: the program names itself to the MCP server, or
`kito lane open --assistant NAME` says it by hand. It is a label, by which
nothing is decided. See [Lanes, intents and scopes](../../concepts/lanes/).

## See who is on what

```bash
kito lanes     # the lanes, one on a line, as below
kito board     # what each declared and is changing, and which are on the same code
kito watch     # what happens, as it happens
kito web       # the same in a browser
```

```text
lane/1   alice        active      base ckpt#1     0 ops   0 files  in claude-code (claude-opus-5)  prices in cents
lane/2   bob          active      base ckpt#1     0 ops   0 files  in codex (gpt-5-codex)  say what the shop sells
```

The web client is a plugin, not a part of Kito. `kito web` is there once
the plugin is installed and the repository has enabled it
(`kito plugin enable web`). It serves on this machine only.

## Comment and review

```bash
kito lane diff 1
kito lane comment 1 "Half a cent is lost: round, do not floor." --on src/shop.ts:4
kito lane request-changes 1 "See the comment on line 4."
kito lane approve 1
```

`kito lane diff` shows what a lane changes, by file and by function. A
comment is how a person tells an agent in a lane what to change: the
agent's next edit is held back once, with the comments it has not read. A
request for changes stops the lane until it is taken back or replaced.
Approving brings nothing in: integrating does.

## Integrate

```bash
kito integrate lane/1
kito integrate lane/1 lane/2 lane/3
```

```text
lane/1: integrated as ckpt#7 (git 8d020c87a9), verified in 2.0 s together with 2 other lanes
```

The lane is composed with the main lane as it is now, function by function
([Merging](../../concepts/merging/)). The checks of the repository
(`[verify] commands` in `.kito/config.toml`) run on a copy of the merged
result. What lands is a checkpoint, which is also a git commit. Lanes asked
for together are checked in one run when they do not depend on each other.

## Decide a conflict

```bash
kito conflicts
kito resolve conflict#1 --lane
```

A real conflict is the same lines of the same function, or a function
removed on one side and changed on the other. It stops that lane only. It
is decided by taking one side or by writing the text. Then integrate again.

## Ask why

```bash
kito why src/shop.ts:total
kito reasons cents
```

`kito why` answers for a function, a file or some lines: the reasons it
changed, who changed it and for whom, the lane, the checkpoint, and who
uses it. `kito reasons` finds earlier work by the words of its reason. See
[Why code is the way it is](../../concepts/why/).

## Git

There is nothing to run for git on an ordinary day. Every checkpoint of the
main lane is exported as a git commit, and can be pushed to a remote
(`[git] push` in the configuration), never forced. Commits made with plain
git on that remote come back in through a lane before every push
([Git, both ways](../../concepts/git/)). To bring them in sooner, or after
a conflict with them was decided:

```bash
kito pull
```

## A team on a server

`kito-server` keeps several repositories behind one door, and knows who
each client is. On the server:

```bash
kito-server init /srv/kito
kito-server --dir /srv/kito repo add shop --from /path/to/a/git/repository
kito-server --dir /srv/kito repo set shop --check "npm test" --push origin
kito-server --dir /srv/kito repo set shop --approvals 1
kito-server --dir /srv/kito user add bob --repo shop:write
kito-server --dir /srv/kito serve
```

A repository added with its history is protected: its main lane changes
only when a lane is integrated. Its checks, its git remote and the
approvals it asks for are set on the server. `user add` prints the person's
token once, and the whole `kito connect` line. Each person connects a
directory of their own, where `kito` then works as it does in a repository:

```bash
kito connect kito.example.com/shop   # signs you in in the browser
```

People have roles. `read` sees and follows. `write` opens lanes and works
in them. `integrate` brings lanes into the main lane. A lane asked for by
somebody who may write is merged and checked, then waits until somebody who
may integrate runs `kito integrate`.

Next: [The life cycle of a change](../lifecycle/), with who does what.
