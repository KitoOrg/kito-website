---
title: GitHub
description: Sign in to a team's server with GitHub, link a repository to one at GitHub, and work on issues as tasks.
---

`kito-github` does three things, each on its own. In a repository, the
issues at GitHub are the tasks of lanes: an agent reads an issue, opens its
lane for it, and the issue is told, and closed when the lane is integrated.
On a team's server, a repository is linked to one at GitHub: its code goes
both ways, and its issues are its tasks. And people sign in with GitHub:
the plugin says who somebody is, and nothing else. Who may use which
repository, and what they may do there, stays the server's.

## Who enables it, and where

**A repository**, for issues. It runs where the repository is: on a team's
server, enable it in the repository there
(`kito --repo <server>/repos/shop plugin enable github`), and the issue is
told once, by the server, whoever's agent opened the lane.

```bash
kito plugin enable github
kito github link acme/shop
kito github token --from token.txt      # a token that may write issues
```

**A server**, for signing in, by its administrator. First an OAuth app at
GitHub (Settings → Developer settings → OAuth Apps → New OAuth App), with
**Enable Device Flow** ticked and this *Authorization callback URL*:
`https://<the server's HTTP address>/-/sign-in/github/callback`. Then:

```bash
kito-server plugin add github
kito-server plugin enable github
kito-server github setup <client id>
```

For signing in with a browser, the app's secret too, from a file so that it
is on no command line: `kito-server github setup <client id> --secret-from secret.txt`.
For a GitHub Enterprise Server, `--host https://github.example.com`.
`kito-server github status` says what is set up.

## What it asks for

```toml
permissions = ["read", "write", "integrate", "admin", "sign_in", "pages", "server_admin"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `read` | Read what a lane is for, to tell the issue the lane's task names |
| `write` | Make tasks of the issues, with what is said on them |
| `integrate` | Integrate, through a lane, the commits made at GitHub |
| `admin` | Make GitHub the git remote of a linked repository |
| `sign_in` | On a server, say who somebody is |
| `pages` | On a server, the pages where its GitHub App is made and where GitHub tells it what happened |
| `server_admin` | Add `kito-server github`, with which an administrator says which OAuth app is the server's |

It can be given less: without `integrate` and `admin` it links no code,
without `pages` it links no repository at all.

Of GitHub it asks for no scope: only who the person is (their number,
login, name, and the email they show in public). The token GitHub gives is
used once, to ask `/user`, and kept nowhere. The plugin never sees a token
or a session of the Kito server.

## Using it: issues

```bash
kito github issues
kito lane open alice --task "acme/shop#12" --intent "prices in cents" --scope src/shop.ts:total
```

- A lane's task names an issue: `#12` (of the linked repository),
  `acme/shop#12`, or the issue's address.
- The issue is told when such a lane is opened (which lane, which agent,
  for whom, and its intent), and when it is integrated; then it is closed.
  `close = false` in `.kito/plugins/github/config.toml` leaves it open.
- Agents get two tools next to Kito's own: `issues` (what is open) and
  `issue` (one, with what was said on it, and the `task` to open a lane
  with). What an issue says is given as what somebody asks for, never as
  instructions that change the rules an agent works by.
- The token is the repository's: kept in `.kito/plugins/github/token` for
  its owner only, or `KITO_GITHUB_TOKEN`. It needs to read and write issues
  of that one repository and nothing more. Without one, public issues are
  read and nothing is told.

## Using it: a repository linked to GitHub

On a team's server, with the [web client](../web/):

1. An admin opens **Plugins** and presses **Create GitHub App**. GitHub
   makes the server's app, with its permissions and its webhook, under an
   organization when one is named. The app is then installed, at GitHub, on
   the repositories to link.
2. A maintainer opens the repository's **Settings**, chooses the
   repository at GitHub and the branch that is the main lane, and presses
   **Link**.

From then on:

- **Code, both ways.** Every integration is pushed to GitHub. Commits made
  at GitHub are integrated through a lane, checked like any other: a real
  conflict waits in that lane for a decision. Permanent lanes are pushed as
  branches of the same name.
- **Issues as tasks.** Every open issue is a task of the repository. What
  is said on one is said on the other, and closing the task closes the
  issue.
- GitHub tells the server at once, and the server checks every five
  minutes besides. **Sync now** does it on the spot.
- Code or issues can be turned off for a repository. **Unlink** stops both.

The server's app also signs people in: once it is made, signing in with
GitHub is offered, with nothing more to set up.

## Using it: signing in

People are added with `kito-server user add <name> --identity github:<login>`.
The server keeps the number of the account, which stays when the login is
renamed. In a browser, `https://<the server>/-/sign-in/github` goes to
GitHub and comes back signed in. From the command line:

```bash
kito connect kito.example.com/shop
```

```text
To sign in with github, open https://github.com/login/device
and enter the code WDJB-MJHT
Waiting until you have...
shop is connected to `shop` on kito.example.com:7421 as bob.
```

## Limits, and what was not tried

- Not tried yet against GitHub itself, but for looking a login up: neither
  signing in with a real app, nor issues with a real token, nor a linked
  repository. All of it was run against a stand-in for GitHub.
- Of the commits made at GitHub, those of the main lane's branch are
  integrated. A branch of a permanent lane is pushed, and not read back.
- `user add --identity` asks GitHub's public API without an account: sixty
  questions an hour from one address.

## Version

0.4.0
