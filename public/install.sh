#!/bin/sh
# Installs Kito from its release on GitHub (github.com/KitoOrg/kito):
# `kito`, `kitod`, `kito-mcp` and `kito-server`, in ~/.local/bin unless
# KITO_INSTALL_DIR says otherwise.
#
#   curl -fsSL https://kito.sh/install.sh | sh
#
# Then it looks for the coding assistants this machine has (Claude Code,
# Codex, ZCode) and asks, for each, whether every new Kito project should
# get it set up: the answer is kept with `kito assistant default`.
#
# KITO_VERSION=0.39.1    a version instead of the latest
# KITO_INSTALL_DIR=DIR   where the programs go
# KITO_RELEASES=URL      the releases (default https://github.com/KitoOrg/kito/releases)
# KITO_NO_ASK=1          ask nothing: say what was found, and how to choose
#
# What is downloaded is checked against its SHA-256 before anything of it
# is put anywhere.
set -eu

RELEASES="${KITO_RELEASES:-https://github.com/KitoOrg/kito/releases}"
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
  # The latest release is where its page sends: .../releases/tag/v0.39.1
  latest=$(curl -fsLI -o /dev/null -w '%{url_effective}' "$RELEASES/latest") \
    || die "no release yet at $RELEASES (see https://kito.sh/install/ to build from source)"
  version="${latest##*/}"
fi
version=$(printf '%s' "$version" | tr -d ' \n\r' | sed 's/^v//')
case "$version" in
  *[!0-9A-Za-z.+-]* | "" | latest | releases) die "no release yet at $RELEASES (see https://kito.sh/install/ to build from source)" ;;
esac
name="kito-$version-$os-$arch"
BASE="$RELEASES/download/v$version"

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

# The coding assistants this machine has, and whether new projects get them.
title() {
  case "$1" in
    claude) echo "Claude Code" ;;
    codex) echo "Codex" ;;
    zcode) echo "ZCode" ;;
  esac
}
found=""
for name in claude codex zcode; do
  if command -v "$name" > /dev/null 2>&1 || [ -d "$HOME/.$name" ]; then
    found="$found $name"
  fi
done
if [ -n "$found" ]; then
  # Asked at the terminal, even when this script came through a pipe.
  if [ -z "${KITO_NO_ASK:-}" ] && (exec < /dev/tty) 2> /dev/null; then
    wanted=""
    for name in $found; do
      printf 'kito: %s is on this machine. Set it up in every new Kito project? [Y/n] ' "$(title "$name")" > /dev/tty
      read -r answer < /dev/tty || answer=n
      case "$answer" in
        n | N | no | No | NO) ;;
        *) wanted="$wanted $name" ;;
      esac
    done
    if [ -n "$wanted" ]; then
      # shellcheck disable=SC2086
      "$DIR/kito" assistant default $wanted > /dev/null && say "new projects get:$wanted (kito assistant default changes it)"
    else
      "$DIR/kito" assistant default --none > /dev/null && say "new projects get no assistant (kito assistant default changes it)"
    fi
  else
    say "found here:$found. To set them up in every new project: kito assistant default$found"
  fi
fi

case ":$PATH:" in
  *":$DIR:"*) ;;
  *) say "add it to your PATH:  export PATH=\"$DIR:\$PATH\"" ;;
esac
say "next: https://kito.sh/getting-started/first-steps/"
