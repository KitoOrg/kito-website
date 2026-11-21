---
title: With Claude Code
description: Let Claude Code work through Kito, one lane per task.
---

`kito init` and `kito import` set the project up for Claude Code when it is
one of your assistants (they ask, or do what `kito assistant default`
says). In a project that is already there:

```bash
kito assistant add claude
```

That writes:

| File | What goes in it |
| --- | --- |
| `.gitignore` | `.kito/`, so that git does not see Kito's own directory |
| `.mcp.json` | the `kito` MCP server: `{ "command": "kito-mcp" }` |
| `.claude/settings.json` | the Kito tools allowed, and hooks that hold Claude to the rules |
| `CLAUDE.md` | the rules: one lane per task, edits only in the lane, renames through `rename_symbol`, integrate at the end |

Each file is touched only for what is missing in it; a second run changes
nothing. `kito assistant remove claude` takes it out again. Codex and
ZCode are set up the same way: `kito assistant add codex`.

Then start Claude Code in the project directory. The first time, it asks to
trust the folder and to approve the `kito` server; `/mcp` shows it connected.
`kito-mcp` has to be on the `PATH`.

From there, a task asked in plain words is done in a lane and integrated.

## The rules, enforced

The hooks refuse an edit outside a lane, or outside what the lane declared,
before it is made. Before Claude changes code, it is told why that code is
the way it is: who wrote it, for what, and who uses it.

## Other agents

Any MCP client can use `kito-mcp`:

```json
{
  "mcpServers": {
    "kito": { "command": "kito-mcp", "args": ["--repo", "/path/to/the/repository"] }
  }
}
```

If the client does not accept a dot in tool names, add
`"--tool-prefix", "kito_"`.
