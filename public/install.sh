#!/bin/sh
# Installs Kito from kito.sh: `kito`, `kitod`, `kito-mcp` and
# `kito-server`, in ~/.local/bin unless KITO_INSTALL_DIR says otherwise.
#
#   curl -fsSL https://kito.sh/install.sh | sh
#
# KITO_VERSION=0.23.0    a version instead of the latest
# KITO_INSTALL_DIR=DIR   where the programs go
# KITO_DOWNLOADS=URL     where the archives are (default https://kito.sh/downloads)
#
# What is downloaded is checked against its SHA-256 before anything of it
# is put anywhere.
set -eu

BASE="${KITO_DOWNLOADS:-https://kito.sh/downloads}"
DIR="${KITO_INSTALL_DIR:-$HOME/.local/bin}"

say() { printf 'kito: %s\n' "$*" >&2; }
die() { say "$*"; exit 1; }
need() { command -v "$1" > /dev/null 2>&1 || die "this needs $1"; }

need curl
need tar
need uname

case "$(uname -s)" in
  Linux) os=linux ;;
  Darwin) os=macos ;;
  *) die "no build for $(uname -s) here: on Windows, see https://kito.sh/install/" ;;
esac
case "$(uname -m)" in
  x86_64 | amd64) arch=x86_64 ;;
  aarch64 | arm64) arch=$([ "$os" = macos ] && echo arm64 || echo aarch64) ;;
  *) die "no build for $(uname -m)" ;;
esac

version="${KITO_VERSION:-}"
if [ -z "$version" ]; then
  version=$(curl -fsSL "$BASE/latest") || die "no release yet at $BASE (see https://kito.sh/install/ to build from source)"
fi
version=$(printf '%s' "$version" | tr -d ' \n\r' | sed 's/^v//')
case "$version" in
  *[!0-9A-Za-z.+-]* | "") die "what $BASE/latest says is not a version" ;;
esac
name="kito-$version-$os-$arch"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
say "downloading $name"
curl -fsSL -o "$tmp/$name.tar.gz" "$BASE/$name.tar.gz" || die "there is no $name.tar.gz at $BASE"
curl -fsSL -o "$tmp/$name.tar.gz.sha256" "$BASE/$name.tar.gz.sha256" || die "there is no checksum for $name at $BASE"

wanted=$(cut -d' ' -f1 "$tmp/$name.tar.gz.sha256")
if command -v sha256sum > /dev/null 2>&1; then
  got=$(sha256sum "$tmp/$name.tar.gz" | cut -d' ' -f1)
else
  need shasum
  got=$(shasum -a 256 "$tmp/$name.tar.gz" | cut -d' ' -f1)
fi
[ -n "$wanted" ] && [ "$got" = "$wanted" ] || die "the download is not the file that was published (SHA-256 $got, expected $wanted): nothing was installed"

tar -xzf "$tmp/$name.tar.gz" -C "$tmp"
mkdir -p "$DIR"
for program in kito kitod kito-mcp kito-server; do
  [ -f "$tmp/$name/$program" ] || die "$program is not in the archive"
  # Put beside, then moved: a program that is running is not written over.
  cp "$tmp/$name/$program" "$DIR/.$program.new"
  chmod 755 "$DIR/.$program.new"
  mv -f "$DIR/.$program.new" "$DIR/$program"
done

say "Kito $version is in $DIR"
case ":$PATH:" in
  *":$DIR:"*) ;;
  *) say "add it to your PATH:  export PATH=\"$DIR:\$PATH\"" ;;
esac
say "next: https://kito.sh/getting-started/first-steps/"
