#!/usr/bin/env bash
# Writes Kito's latest release, as GitHub has it, where the site's header
# takes it from: src/data/kito.json. Run it after every release of Kito
# (scripts/registry-sync.sh runs it too); the version is written nowhere
# by hand. It changes that file and nothing else: the change is reviewed
# and merged like any other.
#
#   scripts/kito-version.sh
set -euo pipefail
cd "$(dirname "$0")/.."

tag=$(gh release view --repo KitoOrg/kito --json tagName -q .tagName) || {
  echo "kito: its latest release could not be asked: src/data/kito.json stays as it is" >&2
  exit 1
}
version="${tag#v}"
case "$version" in
  *[!0-9A-Za-z.+-]* | "") echo "kito: \`$tag\` is not a version" >&2; exit 1 ;;
esac
printf '{\n\t"version": "%s"\n}\n' "$version" > src/data/kito.json
echo "kito $version is the latest release"
