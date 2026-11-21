---
title: GitHub
description: Sign in to a team's server with GitHub, and work on issues as the tasks of lanes.
---

`kito-github` does two things, each on its own. In a repository, the issues
at GitHub are the tasks of lanes: an agent reads an issue, opens its lane
for it, and the issue is told, and closed when the lane is integrated. On a
team's server, people sign in with GitHub: the plugin says who somebody is,
and nothing else. Who may use which repository, and what they may do there,
stays the server's.

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
scripts/build.sh --dist
kito-server plugin add --path plugin
kito-server plugin enable github
kito-server github setup <client id>
```

For signing in with a browser, the app's secret too, from a file so that it
is on no command line: `kito-server github setup <client id> --secret-from secret.txt`.
For a GitHub Enterprise Server, `--host https://github.example.com`.
`kito-server github status` says what is set up.

## What it asks for

```toml
permissions = ["read", "sign_in", "server_admin"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `read` | In a repository, read what a lane is for, to tell the issue the lane's task names. It changes nothing of the repository |
| `sign_in` | On a server, say who somebody is |
| `server_admin` | Add `kito-server github`, with which an administrator says which OAuth app is the server's |

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

## Using it: signing in

People are added with `kito-server user add <name> --identity github:<login>`.
The server keeps the number of the account, which stays when the login is
renamed. In a browser, `https://<the server>/-/sign-in/github` goes to
GitHub and comes back signed in. From the command line:

```bash
kito connect kito.example.com:7421 shop --sign-in github --fingerprint sha256:…
```

```text
To sign in with github, open https://github.com/login/device
and enter the code WDJB-MJHT
Waiting until you have...
shop is connected to `shop` on kito.example.com:7421 as bob.
```

## Limits, and what was not tried

- Not tried yet against GitHub itself, but for looking a login up: neither
  signing in with a real OAuth app, nor issues with a real token.
- `user add --identity` asks GitHub's public API without an account: sixty
  questions an hour from one address.

## Version

0.2.0
