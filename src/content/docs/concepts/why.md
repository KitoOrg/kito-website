---
title: Why code is the way it is
description: The reasons of every function, file and line, told before code changes.
---

Every change in Kito is recorded with the intent of the lane that made it.
So Kito can answer, for a function, a file or some lines: the reasons it
changed, who changed it and for whom, in which lane, under which checkpoint,
what else changed for the same reason, and who uses it.

```bash
kito why src/shop.ts:total
kito why src/shop.ts:12-20
kito why src/shop.ts:total --history
```

Lines that came to the main lane through an integration are told with the
reason they were written for in their lane, by whoever wrote them, also when
they came through a lane stacked on another.

## Told before changing

An agent is told these reasons before it changes the code: when it opens a
lane or extends its scope, Kito answers with why what it declared is the way
it is. If a lane replaced code written for reasons its agent was not told,
the integration stops and gives those reasons first.

Earlier work can be found by the words of its reasons:

```bash
kito reasons "negative prices"
```
