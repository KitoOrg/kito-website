---
title: Install
description: Install Kito on Linux, macOS or Windows.
---

Kito is four programs:

| Program | What it does |
| --- | --- |
| `kito` | The command line |
| `kitod` | The daemon that records every save, one per repository |
| `kito-mcp` | The MCP server agents talk to |
| `kito-server` | One server for several repositories, for a team |

## Platforms

- **Linux** and **macOS**.
- **Windows** (10 or later), as it is. In WSL too: keep your repositories
  in the Linux file system there (`~/…`), not under `/mnt/c`, where file
  events and lane copies are slow.

## From a release

:::note
There is no public release yet. Until there is, build from source (below).
The [download page](../download/) will list the archives for each platform.
:::

## From source

You need git, a C compiler, and Rust 1.90 or later
([rustup](https://rustup.rs)).

```bash
git clone https://github.com/KitoOrg/kito
cd kito
cargo build --release -p kitod -p kito-cli -p kito-mcp -p kito-server
```

Then put the programs on your `PATH`:

```bash
export PATH="$PWD/target/release:$PATH"
```

Check it:

```bash
kito --version
```

## Optional

- **Language servers**, for renames that follow every use:
  `typescript-language-server`, `gopls`, `pyright`, `rust-analyzer`,
  `intelephense` and `clangd` are found by themselves when installed.
- **Linux 5.13 or later** confines the checks of an integration and the
  commands run in a lane (Landlock): they write only in their own copy.

Next: [First steps](../getting-started/first-steps/).
