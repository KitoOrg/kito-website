---
title: Lanes on lanes
description: Build on another agent's work before it lands.
---

An agent can build on another agent's work before it lands. A lane opened
`--on` another starts from it as it is, and lands on it:

```bash
kito lane open bob --intent "show the team on the page" --scope src/page.py --on lane/1
```

Landing on a lane makes no checkpoint and runs no checks: the main lane does
not move, and the work is checked when it gets there, with the lane it landed
on. The lane landed on takes on the scope of what landed on it, since it
brings it further.

```text
lane/2: landed on lane/1
  it reaches the main lane when lane/1 does
```

## Landing further down

A lane can land further down than the lane it starts on, on main for
instance. It then waits until the work it was built on is there, and brings
only its own:

```bash
kito lane open carol --intent "the team is tested" --scope tests/ --on lane/1 --target main
```

```text
lane/3: lane/3 is built on lane/1, whose work is not on main yet: integrate lane/1 first
```

## Closing

A lane with lanes on it closes once the work they were built on has landed;
they are then moved to where it went. Lanes stack as deep as needed.

The design is in [ADR 0001](https://github.com/KitoOrg/kito/blob/main/docs/adr/0001-lanes-on-lanes.md).
