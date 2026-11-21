---
title: OpenID Connect
description: Sign in to a team's server with your organization's own sign-on.
---

`kito-oidc` signs people in to a Kito server with OpenID Connect: your
organization's own sign-on (Google, Okta, Microsoft Entra, Keycloak, Auth0
and the like). It says who somebody is, and nothing else. Who may use which
repository, and what they may do there, stays the server's.

## Who enables it, and where

A server, by its administrator. First a client at the provider (an
"application", an "app registration"):

- *Redirect URI*: `https://<the server's HTTP address>/-/sign-in/oidc/callback`,
  for signing in with a browser.
- For `kito connect --sign-in oidc`, the provider must give codes to enter
  (the *device authorization grant*, RFC 8628), and the client must be
  allowed to use it.
- It asks for `openid profile email`.

Then the plugin, on the server:

```bash
scripts/build.sh --dist
kito-server plugin add --path plugin
kito-server plugin enable oidc
kito-server oidc setup <issuer> <client id> [--secret-from <file>]
```

The issuer is the provider as it names itself
(`https://accounts.google.com`, `https://<tenant>.okta.com`,
`https://login.microsoftonline.com/<tenant>/v2.0`,
`https://<host>/realms/<realm>`). It is asked when you set it up: one that
is not an issuer is said then. The secret comes from a file, so that it is
on no command line; a client without one (a public client) needs none.

## What it asks for

```toml
permissions = ["sign_in", "server_admin"]
```

| Permission | What it lets the plugin do |
| --- | --- |
| `sign_in` | Say who somebody is |
| `server_admin` | Add `kito-server oidc`, with which an administrator says which provider and which client are the server's |

It is given nothing of any repository, and never sees a token or a session
of the Kito server.

## Using it

People are added with `kito-server user add <name> --identity oidc:<their email>`.
They then connect:

```bash
kito connect kito.example.com:7421 shop --sign-in oidc --fingerprint sha256:…
```

```text
To sign in with oidc, open https://www.google.com/device
and enter the code ABCD-EFGH
Waiting until you have...
shop is connected to `shop` on kito.example.com:7421 as bob.
```

In a browser, `https://<the server>/-/sign-in/oidc` goes to the provider
and comes back signed in.

By default the server knows a person by their **email**, in small letters,
and only if the provider says it was verified (`email_verified`).
`--subject sub` knows people by the provider's own name for them (`sub`)
instead: it never changes and is never given to another, and it is a string
nobody knows by heart. They are then added with `--identity oidc:<sub>`.

What it checks, and what it keeps:

- The provider is reached by https, always (but for one on this machine,
  for tests), and must name itself as it was set up.
- The ID token comes from the provider's token endpoint itself, over that
  connection. It must be from the issuer, for this client, not run out,
  and, for a browser, carry what the sign-in was started with (`nonce`).
- A browser's code is redeemed with PKCE.
- The tokens are used once and kept nowhere. It keeps
  `plugins/oidc/config.toml` (the issuer, the client, its secret if any)
  and `plugins/oidc/key` (a random key of its own), under the server's
  directory and for the server's user only.

## Limits, and what was not tried

- Not tried yet with a real client at a real provider: only what a provider
  says of itself has been read from one. The tests ask a provider that is a
  few lines of `tests/oidc.rs`.
- Not every provider has the device authorization grant.
  `kito-server oidc status` says whether this one does.
- A provider that does not say whether an email was verified (Microsoft
  Entra does not) is refused, unless you say `--trust-email`. Say it only
  for a provider that is your organization's alone and where people cannot
  set their own email: with a provider anybody can register at, an
  unverified email lets one person sign in as another.
- The ID token's signature is not checked again: it comes from the token
  endpoint itself, as the specification allows (OpenID Connect Core 3.1.3.7).

## Version

0.1.0, written for version 1 of the daemon's API.
