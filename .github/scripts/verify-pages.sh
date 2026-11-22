#!/usr/bin/env bash
set -eu -o pipefail

# The branch publisher deploys the whole site. Check the actual data from
# this run before requesting recovery, including when retrying a failed job.
path=$1
expected=$(sha256sum "$path" | cut -d' ' -f1)
page="https://moriahise.github.io/Minhal-haMikdash/$path"
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
for attempt in $(seq 1 32); do
  if curl --fail --silent --show-error --location --max-time 10 \
    "$page?revision=$expected&check=$attempt" --output "$tmp" &&
    printf '%s  %s\n' "$expected" "$tmp" | sha256sum --check --status; then
    echo "Online bestätigt: $path ($expected)"
    exit 0
  fi
  if [[ $attempt == 9 || $attempt == 20 ]]; then
    status=$(gh api "repos/$GITHUB_REPOSITORY/pages/builds/latest" --jq .status || true)
    case "$status" in
      building|queued) echo "Pages veröffentlicht bereits." ;;
      *) gh api --method POST "repos/$GITHUB_REPOSITORY/pages/builds" --silent ||
           echo "Pages-Build konnte noch nicht angefordert werden. Prüfe weiter." ;;
    esac
  fi
  sleep 12
done
echo "::error::Pages liefert den erwarteten Stand für $path noch nicht aus."
exit 1
