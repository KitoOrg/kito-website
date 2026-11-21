---
title: Kitchen
description: What a team shares to work on its repositories, kept on its server and given to every agent.
---

`kito-kitchen` gives a team a **kitchen**: how its agents behave, what its
words mean, how things are done here, and the tools everybody has. It is
written once, kept on the team's Kito server, and given to every agent of
every person, whatever coding assistant they use.

## Who enables it, and where

A server, by its administrator:

```bash
kito-server kitchen new ./kitchen "Shopworks"      # files to start from
kito-server repo add kitchen --from <a git repository of them>
kito-server plugin add kitchen
kito-server plugin enable kitchen --for-clients
kito-server kitchen set kitchen
kito-server kitchen parts shop rust web            # what `shop` picks
kito-server kitchen show shop                      # what it gets
kito-server kitchen check                          # what is wrong with it
```

Each person installs it once: `kito plugin add kitchen`. In a directory
connected to the server there is nothing to enable: the server did.

## What it asks for

```toml
permissions = ["read", "server_admin"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `server_admin` | On a server, add `kito-server kitchen` |
| `read` | In the directories connected to the server, ask the server's kitchen |

## What a kitchen is

A repository on the server, with these files:

```text
kitchen.toml            name = "Shopworks"
behaviour.md            how agents work here: always told
concepts/<name>.md      what a word of the team means: looked up
recipes/<name>.md       how something is done, step by step: looked up
tools/<name>.toml       a command every agent has, and what it takes
parts/<part>/…          the same, for the repositories that pick the part
```

- **Behaviour** is short, and every agent is given all of it.
- **Concepts** and **recipes** are named. The first line of each file says
  what it is about; an agent is told the names and those lines, and asks
  for the text when it needs it.
- **A tool** is a command, run in the working copy of the lane the agent
  works in: a `script` the kitchen carries or a `command` the machine has,
  its `args`, a `timeout_secs`, and the `[input]` it takes. What an agent
  gives is one word of the command, whatever is in it: no shell reads it.
- **A part** (`parts/rust/`, `parts/web/`) is for the repositories that
  pick it. A repository gets the base and its parts; a part wins over the
  base where both have something of the same name.

It is changed like code: a lane in the kitchen's repository, a review, an
integration. Nothing is copied into `CLAUDE.md` or `AGENTS.md`, so nothing
goes stale there.

## Using it

People read it with `kito kitchen`, `kito kitchen concept <name>` and
`kito kitchen recipe <name>`; `kito kitchen run <tool> --lane <lane>` runs
one of its tools. Agents get four tools next to Kito's own:

- `kitchen`: the behaviour, and what concepts, recipes and tools there are;
- `concept`, `recipe`: the text of one;
- `run`: one of the kitchen's tools, in the lane the agent works in.

When a session starts the agent is told the behaviour and the lists without
asking, after Kito's own rules. What they answer says whose words these
are: the team's instructions, to follow, and not Kito's own rules, which
stand whatever a kitchen says.

When the server cannot be reached, the kitchen is the one it last gave, and
says how old it is; what was never asked for is not there to give.

## Limits, and what was not tried

- Not used yet by a team, with an assistant in a real session.
- A tool runs confined to the lane where Kito can confine a command (Linux
  5.13 or later): it writes only there, reads nothing of Kito's own or of
  your keys, and reaches the network only if the kitchen says the tool
  needs it. It still reads the rest of your machine, and runs as you:
  whoever may change the kitchen decides what runs, so give that role
  accordingly and review changes to `tools/` like code.
- Where Kito cannot confine a command (macOS, Windows, an older Linux) a
  tool is not run, and says so. `KITO_KITCHEN_UNCONFINED=1` runs the
  kitchen's tools as yourself there, unconfined: your call, on your
  machine. `KITO_KITCHEN_NO_TOOLS=1` turns them off altogether. A kitchen's
  scripts are for a Unix shell.
- Which repository is the kitchen and what each repository picks are kept
  by the plugin on the server (`plugins/kitchen/config.toml`), not in a
  repository: they have no history.
- Everybody who may use a repository of the server may read the kitchen.

## Version

0.3.0
