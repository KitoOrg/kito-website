---
title: Why it is faster for teams of agents
description: Where the time goes when many agents share one repository, what Kito changes, what was measured, and what was not.
---

The title of this page is a claim. Part of it is reasoning about how the
work goes, part of it was measured, and part of it nobody has measured.
This page keeps the three apart.

## Where the time goes with plain git

When many agents work on one repository through branches and pull requests,
time is lost in five places. This is a description of the work, not a
measurement.

- **Waiting to merge.** Where every merge is checked, branches go in one at
  a time. Agents that finish together wait in line, and the line is longest
  on the files everybody touches.
- **Conflicts that are not real.** Git merges lines. Two agents that add a
  function at the same place of a file conflict, though neither touched the
  other's code. Something has to settle it, and the checks run again.
- **Review of work nobody can explain.** A pull request shows what changed.
  Why it changed is what the agent wrote afterwards, if it wrote anything.
  The reviewer works the reason out again.
- **Rework.** An agent changes code whose reason it was never told, and
  undoes what an earlier change was for. It is found in review, or later.
- **People as the bottleneck.** Agents write faster than people read. Every
  conflict, review and merge that needs a person waits for one.

## What Kito changes

**Waiting to merge.** Lanes are merged function by function, so two lanes
on different functions of one file both go in. Lanes that ask at the same
time, write different files and rename or move nothing are checked
together, in one run of the checks. Lanes on the same file are still
checked one after the other.

**Conflicts that are not real.** Different functions of the same file,
functions added at the same place, a function moved in one lane and edited
in another: none of these is a conflict. What remains is the same lines of
the same function, or a function removed on one side and changed on the
other. It stops that lane only. See
[Merging function by function](../../concepts/merging/).

**Review of work nobody can explain.** A lane is opened with its reason,
before a line is written. Its diff lists the functions it added, changed,
removed or renamed, each with the intent of the change. A comment reaches
the agent before its next edit. See
[The life cycle of a change](../lifecycle/).

**Rework.** An agent is told why code is the way it is when it declares it,
and an edit on lines whose reason it was not told is held back once, with
the reasons. It is also told when another lane is on the same code, before
it writes. Being told is not agreeing: the second time, the edit goes
through. See [Why code is the way it is](../../concepts/why/).

**People as the bottleneck.** People are still asked, for less. A conflict
that is not real asks nobody. A lane is merged and checked before a person
is asked to let it in. A real conflict waits for one decision while the
other lanes go on. How much of a person's time this saves was not measured.

## What was measured

Every figure here was taken on one 4-core virtual machine with a virtual
disk: they are valid as comparisons on that machine, not as absolute
values.

### Merges that git does not make

Simulated agents work through Kito
itself. For each integration, git is given the three
states Kito merged, through `git merge-tree --write-tree`.

| The same work | git | Kito |
| --- | --- | --- |
| 10 agents, 4 rounds: 40 integrations | 4 merged, 36 conflicts | 40 merged, 0 conflicts |
| 6 agents, 8 rounds: 48 integrations | 8 merged, 40 conflicts | 48 merged, 0 conflicts |

Every conflict of git is in one file, where each agent adds a method and a
function at the same place. The test was written around that case: the
numbers say how far apart the two are on it, not how often real work looks
like it.

### Waiting at the checks

Ten agents, each on a file of
its own, ask to be integrated at the same instant. The check is `sleep 2`.
The wait is from an agent's request to its answer.

| | Median wait | Longest wait | Runs of the check |
| --- | --- | --- | --- |
| One lane at a time (`batch = 1`) | 11.2 s | 20.3 s | 10 |
| Together (`batch = 8`, the default) | 2.1 s | 4.2 s | 2 |

This compares Kito with itself, not with git. For lanes that write the same
file, the first row still holds.

### The same operations as git

Git 2.43 and Kito on the same 50,000 files,
with `git worktree` for the agents' working copies and `git merge --no-ff`
to bring their work in.

| Operation | git | Kito |
| --- | --- | --- |
| First import of the 50,000 files | 2.6 s | 14.7 s |
| Recording one save | 154 ms (`git add <file> && git commit`) | 13–20 ms of work, about 70 ms after the save; no command |
| A working copy for an agent | 1.6 s (1.56–2.0 s) | 1.1–3.1 s in the same run; 0.46–0.56 s on a quiet disk |
| Bringing in an agent's work, 50 files | 523–676 ms | 135–245 ms with the git commit |
| Bringing in an agent's work, 500 files | 1,202 ms | 447–511 ms with the git commit |

Kito is slower at the first import, because it parses every file, and no
faster at making a working copy in the same run. Either way these are small
operations: this table does not show Kito saving a team time.

### What the rules cost

A repository of
20,000 files and 500,000 operations. Times are of the whole command, as
Claude Code runs it around a tool.

| | Time |
| --- | --- |
| `kito hook before-edit`, a file of a lane, let through | 21–24 ms |
| `kito hook before-edit`, held for a reason | 22–25 ms |
| `kito lane open` on one function, with why it is the way it is | 0.4 s |
| `kito lane open` on a directory of 100 files | 0.7 s |

The first of these after the daemon starts takes 1.3 s more. This says that
the rules cost little at each edit. It does not say that they save time.

### Integration on a large repository

A
repository of 50,000 TypeScript files of 1 kB, with the checks and the git
export off. Integrating a lane that changed one function in each of 50
files took 90 ms, and 299 ms for 500 files. Creating a lane took 462–561 ms
on a quiet run, and from 0.5 s to 2 s or more on consecutive runs, with
every file copied: no file system with reflinks was available.

## What was not measured

- **A real team's throughput.** No team was measured with Kito and without
  it. There is no figure for changes in a day, or for the time from a task
  to its integration.
- **End-to-end time saved.** Every figure above is of one part: a merge, a
  wait at the checks, a command. None is of a whole change.
- **How often real work conflicts.** The test was written around
  one case. No history of real merges has been replayed.
- **Review.** Whether a reviewer who is given the reasons reads faster was
  not measured.
- **Rework.** How often an agent undoes something for want of its reason,
  with Kito or without, was not measured.
- **Real agents, and many of them.** The agents measured are simulated.
  No figure here has more than ten agents, and all are from one machine.
- **What agents cost.** Nothing was measured of what an agent spends, with
  the reasons told to it or without.

Until these exist, the title of this page rests on the mechanisms above and
on the measurements of their parts.
