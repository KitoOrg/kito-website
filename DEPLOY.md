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
- `/install.sh` installs Kito from `/downloads/` (`curl -fsSL
  https://kito.sh/install.sh | sh`): it reads `/downloads/latest`, and
  checks the archive against its `.sha256`. There is nothing in
  `/downloads/` yet: nothing is public, and the script says so.

## Listing a plugin

`node scripts/registry-add.mjs <archive.tar.gz> --platform <platform>`
reads the manifest inside the archive, computes its checksum, and writes
`public/registry/plugins/<name>.json` and `index.json`. Once for each
platform's archive. `--url` says where the archive is when it is not at
`kito.sh/downloads/`; `--copy` puts it in `public/downloads/`. The change
is reviewed and merged like any other: merging it is publishing.

## Publishing a release of Kito

Put `kito-<version>-<platform>.tar.gz` and its `.sha256` in
`public/downloads/`, and the version in `public/downloads/latest`. Large
files are better as a public GitHub release, with `KITO_DOWNLOADS`
pointing there, than in this repository.

## What blocks it today

- The deploy runs on GitHub Actions, which the account's billing has
  stopped: nothing deploys until that is fixed.
- The old address, `kitoorg.github.io/kito-website`, redirects to the
  domain once the domain is set.
