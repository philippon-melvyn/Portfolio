#!/usr/bin/env bash
set -euo pipefail

mode=${1:?Expected validate, prepare, publish or cleanup}
target=${2:?Expected static directory or upload stage}
deploy_root=/var/www/portfolio/Portfolio

validate_static() {
  test -s "$1/index.html"
  # No private configuration, database, source dependencies or symbolic links
  # may cross the publication boundary, including files copied from public/.
  local forbidden
  forbidden=$(find "$1" \( -type l -o -name '.env*' -o -name .git -o -name .astro \
      -o -name node_modules -o -name pb_data -o -name pb_backups \
      -o -name '*.db' -o -name '*.db-shm' -o -name '*.db-wal' \
      -o -name '*.pem' -o -name '*.key' \) -print -quit) || return 1
  if [ -n "$forbidden" ]; then
    echo 'Static output contains a forbidden file, directory or symbolic link.' >&2
    return 1
  fi
}

if [ "$mode" = validate ]; then
  validate_static "$target"
  exit 0
fi

# Validate every remotely managed path before any creation, move or removal.
stage_name=${target#"$deploy_root/.astro/"}
if [[ ! "$stage_name" =~ ^deploy-upload-[0-9]+-[0-9]+$ ]] || \
    [ "$target" != "$deploy_root/.astro/$stage_name" ] || \
    [ -L "$deploy_root/.astro" ] || [ -L "$target" ]; then
  echo 'Invalid upload stage.' >&2
  exit 1
fi
stage=$target
backup="$deploy_root/.astro/deploy-previous"
cd "$deploy_root"

case "$mode" in
  prepare)
    if [ -e "$backup" ] || [ -L "$backup" ]; then
      echo 'Previous backup exists; inspect it before deploying.' >&2
      exit 1
    fi
    umask 022
    mkdir -p .astro
    # Refuse to reuse an incomplete upload, even on a manual rerun.
    mkdir -- "$stage"
    mkdir -- "$stage/dist"
    ;;
  cleanup)
    # The recovery backup is deliberately outside the upload stage.
    # Never remove it here, especially after a failed restoration.
    rm -rf -- "$stage"
    ;;
  publish)
    validate_static "$stage/dist"
    if [ -e "$backup" ] || [ -L "$backup" ] || [ -L dist ] || \
        { [ -e dist ] && [ ! -d dist ]; }; then
      echo 'Unexpected live directory or existing backup; publication refused.' >&2
      exit 1
    fi
    test ! -e "$stage/failed-dist"
    chmod -R u+rwX,go+rX "$stage/dist"

    rollback() {
      result=$?
      trap - EXIT HUP INT TERM
      # No build, database access or restart is ever performed on the VPS.
      if [ -d dist ] && { [ -d "$backup" ] || [ "$promoting" -eq 1 ]; }; then
        if ! mv -T -- dist "$stage/failed-dist"; then
          echo "Cannot move the failed release; backup preserved at $backup." >&2
          exit 1
        fi
      fi
      if [ -d "$backup" ]; then
        if ! mv -T -- "$backup" dist; then
          echo "RESTORATION FAILED: backup preserved at $backup." >&2
          exit 1
        fi
        echo 'Previous static site restored.' >&2
      fi
      if [ "$result" -eq 0 ]; then result=1; fi
      exit "$result"
    }

    # Arm recovery before moving the old site. A failed promotion or an SSH
    # hangup must also restore the backup, not only a failed HTTP request.
    promoting=0
    trap rollback EXIT
    trap 'exit 129' HUP
    trap 'exit 130' INT
    trap 'exit 143' TERM
    if [ -d dist ]; then
      # If this first rename fails, the original dist is still live.
      if ! mv -T -- dist "$backup"; then
        trap - EXIT HUP INT TERM
        echo 'Cannot back up the live site; publication stopped.' >&2
        exit 1
      fi
    fi
    promoting=1
    mv -T -- "$stage/dist" dist

    # Verify the actual new HTML, rather than accepting an old cached HTTP 200.
    curl --fail --silent --show-error --compressed \
      --connect-timeout 10 --max-time 30 \
      --header 'Cache-Control: no-cache' \
      --output "$stage/http-index.html" \
      "https://portfolio.melvyn-philippon.fr/?deploy=$stage_name"
    if ! cmp -s -- dist/index.html "$stage/http-index.html"; then
      echo 'Public response does not match the new static site.' >&2
      exit 1
    fi

    # The new version is now validated. A backup-cleanup failure must never
    # trigger restoration from a potentially partially deleted backup.
    trap - EXIT HUP INT TERM
    if [ -d "$backup" ]; then rm -rf -- "$backup"; fi
    echo 'Static site published and verified.'
    ;;
  *)
    echo 'Unknown deployment operation.' >&2
    exit 1
    ;;
esac
