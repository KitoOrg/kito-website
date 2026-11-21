---
title: Installing and writing plugins
description: How a plugin is installed and enabled, and what the registry holds.
---

Kito has no web view, no sign-on and no knowledge of your coding assistant
built in. Those are **plugins**: programs of their own (`kito-<name>`),
installed by a person, and run only where a repository or a team's server
enabled them, with the permissions it gave.

| Plugin | What it adds |
| --- | --- |
| `web` | Kito in a browser: lanes and their review, why code is the way it is, the log. On your machine, or behind a team's server |
| `kitchen` | A team's kitchen: the behaviour, concepts, recipes and tools it shares, given to every agent whatever assistant it uses |
| `github` | Signing in to a team's server with GitHub |
| `oidc` | Signing in with your organization's own sign-on (OpenID Connect) |
| `codex`, `claude`, `zcode` | A coding assistant set up to work through Kito: its rules, Kito's tools, the hooks that hold it to them |

```bash
kito plugin add --path <directory>   # installed for you
kito plugin enable <name>            # this repository lets it run
```

:::note
The registry at `kito.sh/registry` is empty: no plugin is published yet.
Until one is, a plugin is installed from a directory that holds its
program and its `kito-plugin.toml`. `kito plugin add <name>` will read the
registry.
:::

A plugin is a program run as you. Kito limits what its daemon answers a
plugin; it does not confine what the program does on your machine. Install
the ones whose authors you trust.
