---
title: Running a Kito server
description: Install a Kito server for a team, add its repositories and people, serve it, and connect to it.
---

A Kito server keeps a team's repositories in one place. People and their
agents work from their own machines, in directories connected to it. The
server knows who each client is, and decides who may read, write or
integrate in each repository. The checks of an integration run there, and
the main lane of each repository changes only when a lane is integrated.

## Install

The server uses the same programs as a laptop: [Install](../../install/)
says how to get them. `kito-server` is one of them. Run it on a Linux
machine the team can reach. Each person installs the programs on their
own machine too.

## Set it up

Make a directory for the server, where its repositories and its
certificate are kept:

```bash
kito-server init /srv/kito
```

Add a repository from an existing git repository. Its history comes in:

```bash
kito-server --dir /srv/kito repo add shop --from /path/to/a/git/repository
kito-server --dir /srv/kito repo list
```

A repository added with its history is protected: its main lane changes
only when a lane is integrated. The rules of each repository are set on the server. `--check` is a command
every lane must pass before it is integrated. `--push` is the git remote
that gets every integration, never forced. `--approvals` is how many
approvals a lane needs, from people other than its owner:

```bash
kito-server --dir /srv/kito repo set shop --check "npm test" --push origin
kito-server --dir /srv/kito repo set shop --approvals 1
```

## People

Each person is added with a role:

| Role in a repository | What it lets a person do |
| --- | --- |
| `read` | See lanes and follow them |
| `write` | Open lanes and work in them; their integrations wait |
| `integrate` | Bring lanes into the main lane |
| `maintain` | Change the repository's rules, and say who uses it |

A person has a role in each repository they may use, and nothing in the
others. On the server itself they are a `member` (the repositories given
them), an `admin` (every repository, the people, the plugins) or an
`owner` (as an admin, and names admins and owners).

```bash
kito-server --dir /srv/kito user add ada --role admin
kito-server --dir /srv/kito user add bob --repo shop:write
kito-server --dir /srv/kito grant bob shop integrate
kito-server --dir /srv/kito revoke bob shop
```

`user add` prints the person's token once, with the whole `kito connect`
line they need. The server keeps only what the token hashes to, so pass it
on when it is printed. `--repo shop` alone gives `write`.

Maintainers and admins do the same from a connected directory:

```bash
kito members            # who may use this repository, and as what
kito grant carol read
kito revoke carol
kito people             # admins: everybody on the server
kito people add dave    # prints the token once
```

A lane asked for by somebody who may write is merged and checked at once,
then waits for its approvals and for somebody who may integrate to run
`kito integrate <lane>`.

With the [web client](../../plugins/web/#people) enabled, maintainers and
admins do the same in a browser, on the People and Settings pages, and
admins manage the server's plugins there.

People can sign in with GitHub or with your organization's OpenID Connect
sign-on instead of a token. The plugin says who somebody is. The server
still says what they may do. Such a person is added by their identity, and
gets no token:

```bash
kito-server --dir /srv/kito user add bob --identity github:bob --repo shop:write
```

See [GitHub](../../plugins/github/) and [OpenID Connect](../../plugins/oidc/)
for setting each up. A way to sign in is offered once it is set up, not
before. Tokens stay for scripts and agents.

How somebody signs in can be changed later. A person has a token, an
identity for each way the server offers, or both, and is never left with
none:

```bash
kito-server --dir /srv/kito user link bob github:bob    # he keeps his token
kito-server --dir /srv/kito user unlink bob github
kito-server --dir /srv/kito user token bob              # a new one, printed once; the old one stops at once
kito-server --dir /srv/kito user token bob --remove     # he signs in from then on
kito-server --dir /srv/kito user token bob --alone      # his token leaked: a new one, and nothing else lets in
kito-server --dir /srv/kito user list                   # how each signs in, never a secret
```

A new token says how the person signs in afterwards. Whoever held the
old one may have linked an account of their own while they had it:
`--alone` gives the new token, unlinks every identity and ends every
other session at once.

Admins do the same from their own machine (`kito people link`,
`unlink`, `token`) and on the People page of the web client; only an
owner changes an admin or an owner. Each person changes their own:
`kito people token` is a new token for yourself, `kito people unlink
github` detaches your own account. An account of your own is linked on
the web client's [Account](../../plugins/web/#account) page, by signing in
to it: nobody links themselves by naming a login.

What takes a way to sign in away ends, at once, that person's other
sessions and the connections opened with a token that is no longer
theirs.

## Audit log and backups

Everything that changes the server is kept: people and their access,
rules, plugins, repositories, sign-ins, and each request for 90 days.
Each line is chained to the one before, so a change to the log is found.

```bash
kito-server --dir /srv/kito audit
kito-server --dir /srv/kito audit --verify
```

The whole server is backed up while it serves, every 24 hours, the last
14 kept, compressed and encrypted. The first backup prints the key once:
keep it somewhere else, a restore needs it.

```bash
kito-server --dir /srv/kito backup                    # one now
kito-server --dir /srv/kito backup s3 --endpoint https://s3.eu-central-1.amazonaws.com --bucket my-kito --keys keys.txt
kito-server --dir /srv/kito restore kito-backup-2026-11-22T031500Z.kbak --to /srv/kito-restored
```

Admins read the log and run a backup from their own machine too:
`kito audit`, `kito backup now`.

## Repositories

Admins add, rename and archive repositories from their own machine, once
they are [connected](#connect) to the server, or from the web client's
Repositories page. Whoever adds one maintains it.

```bash
kito repos add notes                                  # new, with a README to start from
kito repos add api --from https://github.com/acme/api.git --token-file token.txt
kito repos add mine --push ~/code/mine                # sent from this machine, history and all
kito repos add mine --push .                          # the repository you are in: sent, and connected where it is
kito repos rename api backend                         # the old name still works
kito repos archive backend                            # hidden; deleted after 30 days
```

A token for a private address is used once for the clone and kept
nowhere. Sent with `--push .` from inside it, your repository becomes a
directory connected to the one on the server, where it is: your files
stay as they are, and its local history is kept beside them, in
`.kito-local-<date>`. Lanes still open are integrated or closed first.

An archived repository is out of reach, and its name stays its own: no
other repository takes it meanwhile. An owner brings it back with `kito
repos unarchive` or deletes it at once with `kito repos delete <name>
--confirm <name>`. On the server's machine: `kito-server repo archive |
unarchive | delete | rename`.

## Serve it

`--listen` says where the server answers; without it, it answers this
machine only. `--http` answers HTTP too, for the
[web client](../../plugins/web/) and for signing in with a browser:

```bash
kito-server --dir /srv/kito serve --listen 0.0.0.0:7421 --http 0.0.0.0:7443
```

What travels between a client and the server is encrypted (TLS). The
server makes a key and a certificate for itself the first time it needs
them, in `tls/` in its directory. Clients know the server by the
certificate's fingerprint, as they know an SSH host by its key. `user add`
prints it in the `kito connect` line, and this prints it again:

```bash
kito-server --dir /srv/kito fingerprint
```

A client keeps the fingerprint, and refuses a server that presents another
certificate before the token is sent. For a certificate from a public
authority, put it and its key in `tls/cert.pem` and `tls/key.pem` in the
server's directory. People then connect with `--authority`, and the server
is known by its name. `serve --plain` encrypts nothing: use it only with
clients on the same machine.

### As a service

This is an example of a systemd unit, not a file Kito ships. Change the
user, the paths and the addresses to yours:

```ini
# /etc/systemd/system/kito-server.service (example)
[Unit]
Description=Kito server
After=network-online.target

[Service]
User=kito
ExecStart=/usr/local/bin/kito-server --dir /srv/kito serve --listen 0.0.0.0:7421 --http 0.0.0.0:7443
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then `sudo systemctl enable --now kito-server` starts it, and starts it
again at every boot.

## Connect

Each person signs in to the server once, from their own machine:

```bash
kito connect kito.example.com
```

Kito asks the server how you can sign in: with GitHub or OpenID Connect
your browser opens, and you confirm it there; or you paste the token
`user add` printed. A server with a certificate of its own shows its
fingerprint once, for you to compare with `kito-server fingerprint`; one
from a public authority is known by its name. Kito then remembers the
server, says who you are there, and lists the repositories you may use.

A directory of a repository is one more command. The files of the main
lane come into it and are kept as the server has them:

```bash
kito clone shop
```

`kito connect kito.example.com/shop` does both at once. The session lasts
thirty days; `kito sign-in` gets another, for every directory of that
server. In a script, say everything on the command line:

```bash
kito connect kito.example.com:7421 --token kito_... --fingerprint sha256:...
```

SSH is another way in (`kito connect ssh://ada@kito.example.com/srv/kito`),
where each key in `authorized_keys` has a forced command that names its
person: `command="kito-server --dir /srv/kito stdio --as ada"`.

### Several servers

Kito keeps the servers you are connected to. One of them is the current
one: the one `kito clone`, `kito repos` and `kito people` ask when you
are not in a connected directory.

```bash
kito server                        # your servers, and who you are on each
kito server use kito.example.com   # the current one
kito clone shop --server other     # one command, another server
kito server remove other           # forgets it
```

A connected directory always uses its own server. A second account on
the same server is kept under a name of its own, with `kito connect
kito.example.com --as work`. What Kito remembers is in a file only you
can read; a connected directory holds no token.

From then on `kito` in a connected directory works as it does in a repository:
lanes, reviews, integrations ([Using Kito, day to day](../using-kito/)). A
lane opened through the server belongs to the person the client signed in
as. `kito watch` shows what happens on the server as it happens.

## Plugins on the server

A server has plugins of its own. They are installed by name from the
registry, then enabled:

```bash
kito-server --dir /srv/kito plugin add web
kito-server --dir /srv/kito plugin enable web
```

- [Web client](../../plugins/web/): Kito in a browser, at the server's HTTP
  address.
- [GitHub](../../plugins/github/): signing in, and repositories linked to
  ones at GitHub, with their issues as tasks.
  [OpenID Connect](../../plugins/oidc/): signing in.
- [Kitchen](../../plugins/kitchen/): how the team's agents behave, kept on
  the server and given to every agent. It is enabled with `--for-clients`,
  so that it runs in the directories connected to the server too.

A plugin that is enabled or disabled counts at once: the server is not
started again. Admins do the same from the web client's Plugins page.

## Checklist

- `kito-server` is installed on a Linux machine the team can reach, and
  `kito-server init` made its directory.
- Each repository is added with `repo add`, with its checks, its remote and
  its approvals set with `repo set`.
- Each person is added with the role they need, and has their token or
  signs in with GitHub or OpenID Connect.
- At least one admin is named with `user role <name> admin`.
- The server is served with `--listen`, and with `--http` for the web
  client, and runs as a service.
- Everybody has the fingerprint, or the server has a certificate from a
  public authority.
- Each person has run `kito connect` with the server's name, and `kito
  clone` for each repository they work on.
