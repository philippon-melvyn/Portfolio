#!/usr/bin/env bash
set -euo pipefail

deploy_root=${1:?Usage: ensure-pocketbase.sh /var/www/portfolio/Portfolio}
public_health=https://pb.melvyn-philippon.fr/api/health
local_health=http://127.0.0.1:8001/api/health

healthy() {
  curl --fail --silent --show-error --connect-timeout 3 --max-time 5 \
    --output /dev/null "$1" 2>/dev/null
}

if healthy "$public_health"; then
  echo "PocketBase is available."
  exit 0
fi

if healthy "$local_health"; then
  echo "PocketBase works on port 8001, but its public URL fails. Check the Apache virtual host."
  exit 1
fi

# The port belongs to the pb.melvyn-philippon.fr virtual host. Never kill
# another process or replace an existing server configuration automatically.
if [ -n "$(ss -H -ltn 'sport = :8001')" ]; then
  echo "Port 8001 is occupied but PocketBase health fails. Inspect the listening process."
  exit 1
fi

# Search only this portfolio installation, excluding old builds and backups.
# Never download a new version or create an empty database to hide a failure.
installation_root=$(dirname "$deploy_root")
mapfile -d '' binaries < <(find "$installation_root" -maxdepth 5 \
  -type d \( -name .astro -o -name .git -o -name node_modules -o -name backups -o -name pb_backups \) -prune -o \
  -type f -name pocketbase -executable -print0)
mapfile -d '' databases < <(find "$installation_root" -maxdepth 6 \
  -type d \( -name .astro -o -name .git -o -name node_modules -o -name backups -o -name pb_backups \) -prune -o \
  -type f -path '*/pb_data/data.db' -print0)

if [ "${#binaries[@]}" -ne 1 ] || [ "${#databases[@]}" -ne 1 ]; then
  echo "PocketBase is stopped. Automatic recovery requires exactly one installed Linux executable"
  echo "named pocketbase and one existing pb_data/data.db under $installation_root."
  echo "Found ${#binaries[@]} executable(s) and ${#databases[@]} database(s)."
  printf 'Executable: %s\n' "${binaries[@]}"
  printf 'Database: %s\n' "${databases[@]}"
  echo "pocketbase.exe is a Windows executable and cannot serve this Linux VPS."
  echo "Restore the existing installation or inspect its paths; the live site has not been changed."
  exit 1
fi

binary=${binaries[0]}
data_dir=$(dirname "${databases[0]}")
if [ ! -r "$data_dir/data.db" ] || [ ! -w "$data_dir" ] || [ ! -w "$data_dir/data.db" ]; then
  echo "The SSH user cannot read/write the existing PocketBase database: $data_dir"
  exit 1
fi

mkdir -p "$deploy_root/.astro"
log_file="$deploy_root/.astro/pocketbase.log"
echo "Starting the existing PocketBase on 127.0.0.1:8001. Log: $log_file"
(
  # Retain this installation's hooks/migrations and keep the process independent
  # of the temporary build and of the SSH session after deployment completes.
  cd "$(dirname "$binary")"
  nohup "$binary" serve --http=127.0.0.1:8001 --dir="$data_dir" \
    </dev/null >>"$log_file" 2>&1 &
)

for attempt in {1..15}; do
  if healthy "$local_health"; then
    if healthy "$public_health"; then
      echo "PocketBase recovered; continuing deployment."
      exit 0
    fi
    echo "PocketBase recovered locally, but its public URL still fails. Check Apache."
    exit 1
  fi
  sleep 2
done

echo "PocketBase did not become healthy. Inspect $log_file on the VPS."
exit 1
