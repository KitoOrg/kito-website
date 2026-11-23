---
title: Kitchen
description: What a team shares to work on its repositories, kept on its server and given to every agent.
---

`kito-kitchen` gives a team a **kitchen**: how its agents behave, what its
words mean, how things are done here, and the tools everybody has. It is
written once, kept on the team's Kito server, and given to every agent of
every person, whatever coding assistant they use.

## Who enables it, and where

A server, by its administrator. Each person installs it once:
`kito plugin add kitchen`. In a directory connected to the server there
is nothing to enable: the server did.

## Starting a kitchen

1. **The plugin**, on the server's machine:

   ```bash
   kito-server plugin add kitchen
   kito-server plugin enable kitchen --for-clients
   ```

2. **The kitchen.** In the [web client](../web/#kitchens), an admin opens
   Kitchens and creates one: a title, the name of its repository, and the
   repositories it is for. The kitchen is a new repository of the server,
   and the repositories that were ticked use it from then on.

3. **Its text**, [drafted with your assistant](#drafting-it-with-your-assistant)
   or written by hand. A kitchen is changed like code: in a lane of its
   repository, reviewed and integrated. In the web client, a file of the
   kitchen is edited in the browser, and a lane is opened for the change.

### Drafting it with your assistant

A new kitchen has nothing in it. Whoever maintains its repository
connects a directory to it, and starts their assistant there:

```bash
kito connect kito.example.com/kitchen
cd kitchen
claude            # or another assistant Kito is set up for
```

When its session starts, the assistant is told that the kitchen is empty,
and offers to draft it with you. It leads an interview:

1. it says what it found in the repositories the kitchen is for;
2. it asks how the team works, one question at a time, and skips what the
   repositories already answer;
3. it proposes as tools only commands those repositories have written
   down, one by one, and writes those you say yes to;
4. it writes everything in one lane of the kitchen's repository;
5. it shows you the files, fixes what is wrong, and asks for the
   integration.

The lane can be read and commented in the web client before it is
integrated; the repositories get the kitchen once it is. On a kitchen
that has content, ask your assistant to revise it: it changes only what
you say. The assistant is yours: Kito runs no model.

The draft is written from what you answer and from the repositories the
kitchen is for, as integrated:

- **what each already tells assistants**: its instructions, and its
  `CLAUDE.md`, `AGENTS.md`, `.cursorrules` and
  `.github/copilot-instructions.md`;
- **what says how it is worked on**: `README`, `CONTRIBUTING`,
  `package.json`, `Makefile`, `justfile`, `Cargo.toml`, `pyproject.toml`,
  `go.mod` and its GitHub workflows, the first 4000 characters of each;
  and the names of its lint and format configuration;
- **the commands those files name**: the scripts of `package.json`, the
  targets of the `Makefile`, the recipes of the `justfile`, the `run:`
  lines of the workflows. None is guessed from the language;
- **its layout**: its directories, two levels down.

Only a maintainer of the kitchen's repository is given any of this, and
only of repositories that use the kitchen. It never reads or names:

- what is under `.git`, `node_modules`, `target`, `dist`, `build` or
  `vendor`;
- a file whose name starts with `.env`;
- a name with `secret`, `credential`, `password`, `token`, `id_rsa` or
  `id_ed25519` in it, or that ends in `.pem`, `.key`, `.p12` or `.pfx`;
- what is not text, and symbolic links.

### Without the web client

On the server's machine:

```bash
kito-server kitchen new ./kitchen "Shopworks"      # files to start from
kito-server repo add kitchen --from <a git repository of them>
kito-server kitchen set kitchen                    # the kitchen of every repository
kito-server repo set shop --kitchen kitchen        # or of one
kito-server kitchen parts shop rust web            # what `shop` picks
kito-server kitchen show shop                      # what it gets, and why
kito-server kitchen check                          # what is wrong with it
```

The files to start from are a short behaviour, one concept, one recipe
and one instruction: examples to replace. From a directory connected to
the server, `kito repos add kitchen --push ./kitchen` sends them too.

## Which kitchen a repository gets

A server can have one kitchen for all its repositories, and a repository
can name one of its own: its maintainers choose it in Settings in the
[web client](../web/#kitchens), or from the kitchen's page.

- A repository gets the kitchen it names; else the server's.
- The repository of a kitchen gets that kitchen: whoever works on a
  kitchen sees it.
- The parts a repository picks are those of the kitchen it gets.

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
kitchen.toml            its name, what it is about, the repositories it is for
behaviour.md            how agents work here: always told
concepts/<name>.md      what a word of the team means: looked up
recipes/<name>.md       how something is done, step by step: looked up
tools/<name>.toml       a command every agent has, and what it takes
instructions/all/…      what every assistant is told, in its own file
instructions/<assistant>/…  the same, for one assistant
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
integration. Its `instructions/` folder holds what every assistant is
told, in Kito's [standard layout](../../guide/instructions/): Kito writes
it into `CLAUDE.md` and `AGENTS.md` of each repository the kitchen is
attached to, at every session, so nothing goes stale there.

## Using it

People read it with `kito kitchen`, `kito kitchen concept <name>` and
`kito kitchen recipe <name>`; `kito kitchen run <tool> --lane <lane>` runs
one of its tools. Agents get five tools next to Kito's own:

- `kitchen`: the behaviour, and what concepts, recipes and tools there are;
- `concept`, `recipe`: the text of one;
- `run`: one of the kitchen's tools, in the lane the agent works in;
- `draft`: in a kitchen's own repository, the interview to draft or
  revise it by.

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
- Which repository is the server's kitchen and what each repository
  picks are kept by the plugin on the server, not in a repository: they
  have no history.
- Everybody who may use a repository of the server may read the kitchen.
- A draft is as good as the assistant that writes it: read the lane
  before it is integrated.

## Version

0.5.0
