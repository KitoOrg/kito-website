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
can use `kito-mcp` as it is. What the assistants are told beyond Kito's
own rules is yours to write: [What your agents are told](../instructions/).

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

## Keep the tasks

What needs doing can be written down where the lanes are. A lane says
which task it is for, and what is said on a task is told to the agents in
its lanes:

```bash
kito task add "Prices lose half a cent" --for bob
kito task                               # what is still to do
kito lane open alice --task task#1 --intent "round, do not floor" --scope src/shop.ts:total
kito task comment task#1 "The receipts too."
kito task done task#1
```

A task is open, then in a lane, then ready to close once its lanes are
closed, then done: a person closes it. An agent takes a task up when it
is told to, and may say that it thinks one is done. With the
[GitHub plugin](../../plugins/github/), the issues of a linked repository
are its tasks.

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
kito lane comment 1 "Rounded now." --reply comment#1
kito lane request-changes 1 "See the comment on line 4."
kito lane approve 1
kito lane review 1                      # where its review stands
```

`kito lane diff` shows what a lane changes, by file and by function. A
comment is how a person tells an agent in a lane what to change: the
agent's next edit is held back once, with the comments it has not read. A
request for changes stops the lane until it is taken back or replaced, and
its agent is told at once. Approving integrates nothing: integrating does.

In the [web client](../../plugins/web/#a-lane) a review is written on the
diff: comments on lines wait as a draft and are sent with the verdict, in
one go. A comment may suggest the lines to put in place, which the agent
applies, or a person with one press.

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
kito note src/shop.ts:total "Called by the nightly billing job: do not rename."
```

`kito why` answers for a function, a file or some lines: the reasons it
changed, who changed it and for whom, the lane, the checkpoint, and who
uses it. `kito reasons` finds earlier work by the words of its reason. A
note says what no change says: it is told with the why of that code, and
to an agent before it changes it. See
[Why code is the way it is](../../concepts/why/).

## Search, and the numbers

```bash
kito search cents                                 # reasons, lanes, tasks, comments, notes, changes
kito search --kind lane --who alice --since 7d
kito search rounding --where src/shop.ts --outcome integrated
kito stats --since 30d
```

`kito search` finds what was done by its words, and narrows it by kind, by
time, by who (a person, an agent, an assistant or a model), by where (a
file, a directory or a function) and by how it ended. `kito stats` gives
the numbers: how lanes flow, what came of the lanes of each assistant and
model, where the code is busy, and review. In a directory connected to a
server, `--everywhere` asks every repository you may use.

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
token once, and the whole `kito connect` line. Each person signs in to
the server once, then makes a directory of the repository, where `kito`
works as it does in a repository of their own:

```bash
kito connect kito.example.com   # signs you in in the browser; the server is remembered
kito clone shop                 # a directory of the repository
```

People have roles. `read` sees and follows. `write` opens lanes and works
in them. `integrate` integrates lanes into the main lane. `maintain`
changes the repository's rules and says who uses it. A lane asked for by
somebody who may write is merged and checked, then waits until somebody who
may integrate runs `kito integrate`.

[Running a Kito server](../server/) has the rest: people, repositories,
signing in, the audit log and backups. With the
[web client](../../plugins/web/) enabled on the server, all of it is in a
browser too.

Next: [The life cycle of a change](../lifecycle/), with who does what.
