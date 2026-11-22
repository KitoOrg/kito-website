---
title: Web client
description: Kito in a browser, for one person on their machine or for a team behind a server.
---

`kito-web` serves a web client for a repository: its lanes and their
review, its tasks, why code is the way it is, the log and the notes. Kito
has no interface of its own, and this one is not part of Kito. It asks the
repository's daemon what `kito` asks, within the permissions it was given.

## Who enables it, and where

**A repository**, for whoever runs it, on their machine: the plugin is
installed for you, then enabled.

```bash
kito plugin add web                 # installed for you
cd your-repository
kito plugin enable web              # this repository lets it read, write and integrate
kito web                            # prints the address to open
```

**A team's server**, which then serves the client itself, at its HTTP
address:

```bash
kito-server plugin add web
kito-server plugin enable web
kito-server serve --http 0.0.0.0:7443     # https://<the server>:7443/
```

## What it asks for

```toml
permissions = ["read", "write", "integrate", "admin", "pages"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `read` | Read the repository |
| `write` | Write comments, verdicts and notes; open and close lanes |
| `integrate` | Ask for integrations and decide conflicts, for whoever opened it |
| `admin` | Change a repository's settings, for its maintainers |
| `pages` | On a server, serve the same client at the server's address, to whoever signs in there |

It can be given less. `kito plugin enable web --only read,write` leaves
integrating to `kito integrate`; `--only read` makes it a viewer.
`kito-server plugin enable web --only read,pages` makes it a viewer for
everybody. The daemon refuses the rest, and the client says so. On a
server, what it may ask of a repository is held both to these and to what
the person may do: somebody who may only read is shown nothing they
cannot do.

## Using it

`kito web` serves on this machine only (`127.0.0.1`, port 7423; `--port N`,
or `--port 0` for any free one) until it is stopped. The address it prints
carries a token, once: the browser that opens it has access, and nobody
else on the machine has. What is done in the browser is done by whoever
runs the repository.

Behind a server, whoever opens the address signs in: in one of the ways the
server's plugins offer ([GitHub](../github/), [OpenID Connect](../oidc/)),
or with the token the server gave them. A way that is not set up yet is not
offered. They land on what needs them, and choose a repository from the
top bar. The client follows the repository as it changes: no reloading.

## The pages

Each page of the client has a **Docs** link that leads here. A page says
little itself.

### Needs you

Behind a server, the first page: what is stopped until you act, across the
repositories you may use. Conflicts to decide, lanes of yours that were
asked to change, lanes that wait for your review, lanes you may integrate,
tasks asked of you and tasks you asked for that are ready to close. Beside
it: each repository with where its lanes stand, who is at work now, and
the lanes that are on the same code.

### Lanes

A lane is one piece of work by one agent
([Lanes, intents and scopes](../../concepts/lanes/)). The list says where
each lane stands, in the same words everywhere:

| It says | It means |
| --- | --- |
| open | Work is under way |
| waits for review | It asked to be integrated and lacks an approval |
| ready to integrate | It asked, and waits only for somebody who may integrate |
| approved | Its approvals are there |
| changes requested | A reviewer asked for changes |
| conflicts to decide | It does not merge until somebody says which side stands |
| outside its scope | It changed code it did not say it would |
| closed | Nothing more happens in it |

The choices above the list are those words. **Open a lane** asks who works
in it, why, and its scope: functions, files or directories.

### A lane

Its head says what it is for, where it stands, who works in it and into
which lane it is integrated. Under it, four parts:

- **Conversation**: the comments and their answers, the verdicts, and the
  conflicts to decide, side by side: keep one side, or write the text.
- **Changes**: files, functions and lines. A comment is left on a line; it
  waits as a draft and is sent with your review. A comment may suggest the
  lines to put in place. A file marked as viewed folds until it changes
  again; "Since my review" shows only what changed after your verdict.
- **Checks**: what stands between the lane and the lane it is integrated
  into: whether it merges, whether it stayed in its scope, where its
  review stands, the repository's check commands.
- **Why**: for each function it touched, the reasons before this one, who
  else is on it now, and the notes left on it.

The bar at the foot of the page holds your review and **Integrate**.
Approving integrates nothing: integrating does, once nothing stops the
lane. See [Using Kito, day to day](../../guide/using-kito/#comment-and-review).

### Tasks

What needs doing in the repository, and the lanes that do it. A task
stands in one of four places: open, in a lane, ready to close (its lanes
are closed, or an agent thinks it is done), done. A person closes it. A
card can be dragged to another column. What is said on a task is told to
the agents in its lanes. A lane is opened for a task with
`kito lane open --task task#3`; agents take one up when you tell them to.
With the [GitHub plugin](../github/), issues are tasks.

### Code and why

The files as the main lane has them. A file is read with, at the edge of
each line, the colour of the reason it was last written for: press a line
to read that reason, or a reason to see its lines. Earlier work is found
by the words of its reason. A function has a page of its own: why it is
the way it is, who uses it, which lanes are on it now, and its notes. See
[Why code is the way it is](../../concepts/why/).

### Log

What is on the main lane, newest first: each checkpoint, the reason it
was made for, and the changes it holds.

### Notes

What whoever changes some code must know, and no change of the code says:
"called by the nightly billing job, do not rename". A note is on a
function, a file, a directory, or a line of a file, which stands for the
function it is in. It is told with the why of that code, and to an agent
before it changes it.

### Insights

The numbers of a repository, or of every repository you may use: lanes
week by week, how long they take, what came of the lanes of each
assistant and model, where the code is busy, and review.

### Search

What was done: reasons, changes, lanes, tasks, comments and notes, by
their words. It can be narrowed by kind, by time, by who (a person, an
agent, an assistant or a model), by where (a file, a directory or a
function) and by how it ended.

### Instructions

What the assistants are told in a repository: Kito's rules first, then
the instructions of the kitchen it uses, then its own, which win where
both have a file of the same name. Kito writes them out for each
assistant at every session: they are not files of the repository. The
page shows each, where it comes from, and what an assistant reads in the
end. An instruction of the kitchen can be disabled here, or replaced by
the repository's own; earlier texts can be put back. See
[What your agents are told](../../guide/instructions/).

### People

For a repository's maintainers and the server's admins: who may use a
repository, and as what. A change counts at once, also in the connections
that are open.

| Role | What it may do |
| --- | --- |
| read | See lanes and follow them |
| write | Open lanes and work in them; their integrations wait for somebody who may integrate |
| integrate | Integrate lanes into the main lane |
| maintain | Change the settings, and say who uses the repository |

Admins and owners of the server maintain every repository. For admins
there is also a page of everybody on the server: a new person gets a
token, shown once, or signs in one of the ways the server offers. Only an
owner names admins and owners. See
[Running a Kito server](../../guide/server/#people).

### Settings

For a repository's maintainers and the server's admins. A change counts
from the next integration, and the server keeps who made it.

- **Main lane**: protected, it changes only when a lane is integrated.
  Not protected, it can also be edited directly on the server.
- **Approvals**: how many people, other than the one a lane is for,
  approve it before it is integrated.
- **Check commands**: commands that must succeed on the merged result,
  one per line, in the order they run. They run on the server's machine:
  only admins change them.
- **Git push**: the git remote every integration is pushed to: a name the
  repository's git knows, or an address. Left empty, nothing is pushed.

Plugins of the server add their own: the kitchen the repository uses, and
with the [GitHub plugin](../github/) the repository at GitHub it is linked
to, the branch of its main lane, and code and issues on or off.

### Kitchens

With the [kitchen plugin](../kitchen/), under the Server menu: what a team
shares to work on its repositories. Each kitchen is read part by part, and
whoever may write in it changes a file in the browser: a lane is opened
for it, and integrated when they may integrate. Maintainers say which
repositories use it. The kitchen plugin's page says how a kitchen is
started.

### Repositories

For the server's admins: every repository, who has it, and its size. One
is added empty, or from a git address (a token for a private one is used
once and kept nowhere). Whoever adds a repository maintains it. One that
is archived is out of reach, and deleted after the days the server keeps
archived ones; an owner restores it or deletes it before then. A renamed
repository is still reached by its old name. To send one from your
machine, history and all: `kito repos add <name> --push <directory>` in a
connected directory.

### Plugins

For the server's admins: the plugins of the server. A plugin is a program
run on the server's machine. It is installed by its name from the
registry, runs nowhere until it is enabled, and is given only what you
tick. Disabling keeps what it stored; "Disable and delete its data" does
not. The plugin that serves these pages is disabled on the server's
machine only. Plugins for the machines people work on are installed
there: `kito plugin add <name>`. See [All plugins](../).

### Audit log

For the server's admins: what changed the server and who did it, kept
forever, and each request, kept 90 days. Every line is chained to the one
before it, so a line taken out or changed is found: the page says whether
the log is whole.

### Backups

For the server's admins: the whole server in one archive, with every
repository, the people and the settings, compressed and encrypted with
the server's backup key. `kito-server backup key` prints the key on the
server's machine: a restore needs it.

```bash
kito-server restore <archive> --to <empty directory> --key <key file>
```

## Limits

- Not yet: extending a lane's scope, renaming a function, permanent lanes'
  catch-up.
- Which assistant a lane's agent runs in is what the assistant said of
  itself. For a lane nobody said anything of, nothing is shown.
- From the page of the server's plugins, a plugin is installed by its name
  from the server's registry and nothing else, and the plugin that serves
  the page is not disabled from it.

## Version

0.19.0
