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

Admins of the server also manage its plugins from a browser, on a page of
the web client.

People can sign in with GitHub or with your organization's OpenID Connect
sign-on instead of a token. The plugin says who somebody is. The server
still says what they may do. Such a person is added by their identity, and
gets no token:

```bash
kito-server --dir /srv/kito user add bob --identity github:bob --repo shop:write
```

See [GitHub](../../plugins/github/) and [OpenID Connect](../../plugins/oidc/)
for setting each up. Tokens stay for scripts and agents.

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

Admins read the log and run a backup from a connected directory too:
`kito audit`, `kito backup now`.

## Repositories

Admins add, rename and archive repositories from any directory connected
to the server, or from the web client's Repositories page. Whoever adds
one maintains it.

```bash
kito repos add notes                                  # empty
kito repos add api --from https://github.com/acme/api.git --token-file token.txt
kito repos add mine --push ~/code/mine                # sent from this machine, history and all
kito repos rename api backend                         # the old name still works
kito repos archive backend                            # hidden; deleted after 30 days
```

A token for a private address is used once for the clone and kept
nowhere. An archived repository is out of reach; an owner brings it back
with `kito repos unarchive` or deletes it at once with `kito repos delete
<name> --confirm <name>`. On the server's machine: `kito-server repo
archive | unarchive | delete | rename`.

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

Each person connects a directory of their own to a repository. The files
of the main lane come into it and are kept as the server has them:

```bash
kito connect kito.example.com/shop
```

`kito clone` is the same command. Kito asks the server how you can sign
in: with GitHub or OpenID Connect your browser opens, and you confirm it
there; or you paste the token `user add` printed. A server with a
certificate of its own shows its fingerprint once, for you to compare
with `kito-server fingerprint`; one from a public authority is known by
its name.

The session lasts thirty days. `kito sign-in` gets another. In a script,
say everything on the command line:

```bash
kito connect kito.example.com:7421/shop --token kito_... --fingerprint sha256:...
```

SSH is another way in (`kito connect ssh://ada@kito.example.com/srv/kito shop`),
where each key in `authorized_keys` has a forced command that names its
person: `command="kito-server --dir /srv/kito stdio --as ada"`.

From then on `kito` in that directory works as it does in a repository:
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
  address. [GitHub](../../plugins/github/), [OpenID Connect](../../plugins/oidc/): signing in.
- [Kitchen](../../plugins/kitchen/): how the team's agents behave, kept on
  the server and given to every agent. It is enabled with `--for-clients`,
  so that it runs in the directories connected to the server too.

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
- Each person has run `kito connect` in a directory of their own.
