---
title: First steps
description: Start recording a project with Kito, mark checkpoints, and see its history.
---

In a new directory:

```bash
kito init
```

In an existing git repository, bring its history in instead:

```bash
kito import
```

Both also set the project up for [Claude Code](../claude-code/);
`--no-claude` leaves that out.

## Every save is recorded

From here on, every save is recorded by the daemon, `kitod`, which `kito`
starts by itself. There are no commits to make. To see what happened:

```bash
kito log
```

```text
  b2bc7079  11-14 21:53  ada     src/version.ts  +1 −1            VERSION changed
◆ ckpt#2  billing  (git 78ff4e73aa)
  928f6f58  11-14 21:53  claude  src/billing.ts  new              invoice created  [integrate lane/1: billing]
  9239b953  11-14 21:53  ada     src/auth.ts     +10 −0, 7 saves  getUser changed; getAdmin created
◆ ckpt#1  start  (git f908e3a85f)
```

One line for each file worked on, however many times it was saved, with what
the saves meant for its functions. `kito log -v` gives every save a line of
its own.

## Checkpoints

A checkpoint marks a point. It is also exported as a git commit:

```bash
kito checkpoint -m "first version"
```

To go back to a checkpoint (recorded as new changes, so it can be undone):

```bash
kito rollback ckpt#1
```

To set who signs the changes:

```bash
kito identity --name "Ada" --email ada@example.com
```

## Functions keep their identity

In Python, JavaScript, TypeScript, Java, C#, C, C++, Go, PHP and Rust files,
Kito follows the functions and classes: one keeps its identity when it is
renamed, edited or moved to another file. Its whole story:

```bash
kito why --history src/users.ts:fetchUser
```

Next: [A first lane](../first-lane/).
