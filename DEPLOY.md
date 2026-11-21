# Serving the site at kito.sh

The site is built by `.github/workflows/deploy.yml` on every push to
`main` and served by GitHub Pages. `public/CNAME` says the domain; these
are the steps that are not in the repository.

## Once, at the registrar of kito.sh

The apex, to GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `kitoorg.github.io` |

Check them against GitHub's own page before trusting this table:
<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site>.

## Once, at GitHub

1. Organization settings → Pages → *Add a domain*: verify `kito.sh`
   (a TXT record GitHub gives you). Nobody else can then point a Pages
   site at the domain.
2. This repository → Settings → Pages: *Custom domain* `kito.sh`, and,
   when the certificate is there (minutes to an hour), *Enforce HTTPS*.

## What is served

- `/` the documents (Astro Starlight, `src/content/docs/`).
- `/registry/` the registry of plugins (`public/registry/`, ADR 0008 of
  Kito): empty until something is published.
- `/install.sh` installs Kito from the latest GitHub release of
  `KitoOrg/kito` (`curl -fsSL https://kito.sh/install.sh | sh`), and
  checks the archive against its `.sha256`. The site holds no archive:
  until that repository is public and has a release, the script says
  there is none.

## Listing a plugin

`node scripts/registry-add.mjs <archive.tar.gz> --platform <platform>`
reads the manifest inside the archive, computes its checksum, and writes
`public/registry/plugins/<name>.json` and `index.json`. Once for each
platform's archive. The archive is listed at the plugin's GitHub release,
`github.com/KitoOrg/kito-<name>/releases/download/v<version>/`; `--url`
says where it is otherwise. The site holds no archive. The change is
reviewed and merged like any other: merging it is publishing.

## Signing the registry

The registry is signed with a key of its own (ADR 0009 of Kito), kept
off this repository and off whatever serves the site:

```console
$ kito registry key ~/keys/kito-sh-registry.key     # once: prints the public half
$ kito registry sign public/registry --key ~/keys/kito-sh-registry.key
```

`sign` gives the index the next number and writes a `.sig` beside every
file: commit them with the change. Sign after every change to the
registry, never before: a file changed since it was signed is refused by
everybody who knows the key.

The public half goes in Kito (`PINNED` in `crates/kitod/src/registry.rs`)
before the registry lists anything: from that release on, the registry
at kito.sh is taken only as that key signed it. Until then it is taken
as its address gives it.

## Publishing a release of Kito

A tag `v<version>` in `KitoOrg/kito` makes its GitHub release
(`release.yml` there): `kito-<version>-<platform>.tar.gz` and its
`.sha256` for each platform. `install.sh` takes the latest from there;
nothing of it is put on this site.

## What blocks it today

- The deploy runs on GitHub Actions, which the account's billing has
  stopped: nothing deploys until that is fixed.
- The old address, `kitoorg.github.io/kito-website`, redirects to the
  domain once the domain is set.
