#!/usr/bin/env bash
# Lists the latest release of each plugin in the registry: downloads the
# archives of the release from GitHub (they stay there), and runs
# registry-add.mjs for each platform. Then it writes Kito's own latest
# release for the site's header (scripts/kito-version.sh). It changes
# public/registry and src/data/kito.json, and nothing else: the change is
# reviewed and merged like any other.
#
#   scripts/registry-sync.sh                 # every plugin of KitoOrg
#   scripts/registry-sync.sh web github      # these
set -euo pipefail
cd "$(dirname "$0")/.."

plugins=("$@")
[ ${#plugins[@]} -gt 0 ] || plugins=(web github oidc kitchen claude codex zcode)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

for name in "${plugins[@]}"; do
  repo="KitoOrg/kito-$name"
  tag=$(gh release view --repo "$repo" --json tagName -q .tagName 2>/dev/null) || {
    echo "kito-$name: no release yet" >&2
    continue
  }
  mkdir -p "$work/$name"
  gh release download "$tag" --repo "$repo" --pattern '*.tar.gz' --dir "$work/$name"
  for archive in "$work/$name"/*.tar.gz; do
    platform=$(basename "$archive" .tar.gz | sed -E 's/^kito-.*-[0-9][^-]*-//')
    node scripts/registry-add.mjs "$archive" --platform "$platform"
  done
  echo "kito-$name $tag listed"
done

bash scripts/kito-version.sh
