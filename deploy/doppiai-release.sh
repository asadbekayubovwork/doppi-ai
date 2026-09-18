#!/bin/bash
# Makes a Do'ppi.ai frontend build live on the production host.
#
#   doppiai-release activate <name>   < dist.tar.gz
#   doppiai-release rollback
#
# Installed as /usr/local/bin/doppiai-release (see "Deployment" in README.md).
# The GitHub Actions deploy key is pinned to this script in
# ~doppiai/.ssh/authorized_keys with `restrict,command="..."`, so that key can
# do nothing else on the host. Under a forced command the client's arguments
# arrive in SSH_ORIGINAL_COMMAND rather than "$@".
set -euo pipefail

root=/var/www/doppiai.uz
releases="$root/releases"
keep=5

die() {
  echo "doppiai-release: $*" >&2
  exit 1
}

if [ $# -eq 0 ] && [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  # Split on whitespace only; the text is never handed to a shell.
  read -r -a words <<<"$SSH_ORIGINAL_COMMAND"
  set -- "${words[@]}"
fi

# deploy.ps1 and CI can race; the second one waits instead of interleaving
# symlink swaps with the first.
exec 9>"$root/.release.lock"
flock -w 120 9 || die "another deploy is still running"

activate() {
  local name="$1"
  [[ "$name" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$ ]] || die "invalid release name: $name"
  local dir="$releases/$name"
  [ ! -e "$dir" ] || die "release already exists: $name"

  # Unpack beside the releases so a truncated upload never appears under a
  # real release name. Global, because the EXIT trap outlives this function.
  incoming=$(mktemp -d "$releases/.incoming.XXXXXX")
  trap 'rm -rf "$incoming"' EXIT
  tar -xzf - -C "$incoming" --no-same-owner --no-same-permissions

  test -f "$incoming/index.html" || die "archive has no index.html"
  # nginx follows symlinks, so a link in the archive could publish any file
  # the web server can read. A Vite build contains only files and directories.
  if [ -n "$(find "$incoming" ! -type f ! -type d -print -quit)" ]; then
    die "archive may only contain regular files and directories"
  fi
  find "$incoming" -type d -exec chmod 755 {} +
  find "$incoming" -type f -exec chmod 644 {} +
  # tar stamps the directory with the build's mtime, which would make every
  # release look equally old to prune; it must carry the deploy time instead.
  touch "$incoming"
  mv -T "$incoming" "$dir"
  trap - EXIT

  # The release being replaced becomes the rollback target.
  if [ -L "$root/current" ]; then
    ln -sfn "$(readlink -f "$root/current")" "$root/previous.tmp"
    mv -T "$root/previous.tmp" "$root/previous"
  fi
  ln -sfn "$dir" "$root/current.tmp"
  mv -T "$root/current.tmp" "$root/current"

  prune
  echo "live: $name"
}

rollback() {
  [ -L "$root/previous" ] || die "no previous release to roll back to"
  local prev curr
  prev=$(readlink -f "$root/previous")
  curr=$(readlink -f "$root/current")
  test -f "$prev/index.html" || die "previous release is missing: $prev"

  ln -sfn "$curr" "$root/previous.tmp"
  ln -sfn "$prev" "$root/current.tmp"
  mv -T "$root/current.tmp" "$root/current"
  mv -T "$root/previous.tmp" "$root/previous"
  echo "live: $(basename "$prev")"
}

# Keeps the newest releases, and never the ones current or previous point at.
prune() {
  local live prev old
  live=$(readlink -f "$root/current")
  prev=$(readlink -f "$root/previous" 2>/dev/null || true)
  # activate() limits names to [A-Za-z0-9._-], so ls output splits safely.
  # shellcheck disable=SC2012
  ls -1dt "$releases"/*/ | tail -n +"$((keep + 1))" | while read -r old; do
    old=${old%/}
    [ "$old" = "$live" ] || [ "$old" = "$prev" ] || rm -rf "$old"
  done
  # Uploads killed before their trap could run.
  find "$releases" -maxdepth 1 -name '.incoming.*' -mmin +60 -exec rm -rf {} +
}

case "${1:-}" in
  activate)
    [ $# -eq 2 ] || die "usage: doppiai-release activate <name> < dist.tar.gz"
    activate "$2"
    ;;
  rollback)
    [ $# -eq 1 ] || die "usage: doppiai-release rollback"
    rollback
    ;;
  *)
    die "usage: doppiai-release {activate <name>|rollback}"
    ;;
esac
