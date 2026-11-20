---
title: Merging function by function
description: Why agents working on the same files rarely conflict in Kito.
---

Kito reads Python, JavaScript, TypeScript, Java, C#, C, C++, Go, PHP and
Rust files as functions and classes, each with an identity that survives
edits, renames and moves to another file.

When a lane is integrated, three states are composed symbol by symbol: where
the lane started, the main lane as it is now, and the lane. So:

- two lanes that changed **different functions of the same file** do not
  conflict;
- two lanes that **added functions at the same place** do not conflict;
- a function **moved** to another file in one lane and **edited** in the
  other keeps the edit, in its new place;
- two edits of the **same function** are merged line by line when they
  touch different lines.

What remains is a real conflict: the same lines of the same function, or a
function removed on one side and changed on the other. It stops that lane
only, and waits for a decision:

```bash
kito conflicts
kito resolve conflict#1 --main      # or --lane, or --text FILE
```

## Renames reach every use

A rename made in one lane reaches the uses another lane added meanwhile
under the old name. With a language server installed it happens by itself;
otherwise Kito reads the syntax, and asks before touching a use it is not
sure of:

```bash
kito rename src/auth.ts:getUser fetchUser --lane lane/1
```

Files Kito does not parse are merged line by line, as text.
