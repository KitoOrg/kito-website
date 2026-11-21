---
title: Web client
description: Kito in a browser, for one person on their machine or for a team behind a server.
---

`kito-web` serves a web client for a repository: its lanes and their
review, why code is the way it is, the log and the notes. Kito has no
interface of its own, and this one is not part of Kito. It asks the
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
permissions = ["read", "write", "integrate", "pages"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `read` | Read the repository |
| `write` | Write comments, verdicts and notes; open and close lanes |
| `integrate` | Ask for integrations and decide conflicts, for whoever opened it |
| `pages` | On a server, serve the same client at the server's address, to whoever signs in there |

It can be given less. `kito plugin enable web --only read,write` leaves
integrating to `kito integrate`; `--only read` makes it a viewer.
`kito-server plugin enable web --only read,pages` makes it a viewer for
everybody. The daemon refuses the rest, and the client says so. On a
server, what it may ask of a repository is held both to these and to what
the person may do.

## Using it

`kito web` serves on this machine only (`127.0.0.1`, port 7423; `--port N`,
or `--port 0` for any free one) until it is stopped. The address it prints
carries a token, once: the browser that opens it is let in, and nobody else
on the machine is. What is done in the browser is done by whoever runs the
repository.

The client shows:

- **The lanes**, as a list: where each stands, whose it is, what it
  declared, which other lanes are on the same code, and which assistant
  its agent runs in.
- **A lane**, in four parts: the conversation, the changes, the checks, and
  why. Comments go on a line of the diff, or on the lane as a whole.
- **Review and integrating**: approve, request changes, withdraw; ask a
  lane to go in, and see how it ended. Approving brings nothing in:
  integrating does.
- **Conflicts**: what the lane and its target both did, side by side; keep
  one, or write the text.
- **Opening and closing** a lane, **why** code is the way it is, **the
  log** of the main lane, and **notes**.

It follows the repository as it changes: no reloading.

Behind a server, whoever opens the address signs in: in one of the ways the
server's plugins offer ([GitHub](../github/), [OpenID Connect](../oidc/)),
or with the token the server gave them. They land on what needs them,
across the repositories they may use, and choose a repository from there
(`?repo=shop`). The client asks the server itself about a repository
(`/-/api/<repository>`), as the person: the plugin only hands out the
client's files. The server's administrators
(`kito-server user admin <name>`) also get a page of the server's plugins:
install, enable, disable and remove.

## Limits

- Not yet: extending a lane's scope, renaming a function, permanent lanes'
  catch-up.
- Which assistant a lane's agent runs in is what Kito 0.25 keeps. With an
  older Kito, or a lane nobody said anything of, nothing is shown.
- From the page of the server's plugins, a plugin is installed by its name
  from the server's registry and nothing else, and the plugin that serves
  the page is not taken out.

## Version

0.10.0
