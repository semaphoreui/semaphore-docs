#!/usr/bin/env bash
# Usage: JOBS=2 bash scripts/build-parallel.sh
# Compatible with macOS Bash 3.2 (no wait -n or associative arrays).
set -euo pipefail

cd "$(dirname "$0")/.."
site_dir="$PWD"
jobs="${JOBS:-5}"
if ! [[ "$jobs" =~ ^[1-9][0-9]*$ ]]; then
  echo 'JOBS must be a positive integer.' >&2
  exit 1
fi

work_root="$site_dir/.docusaurus-build"
mkdir -p "$work_root"
if ! mkdir "$work_root/lock" 2>/dev/null; then
  echo "Another parallel build is running (lock: $work_root/lock)." >&2
  exit 1
fi

pids=()
running_locales=()
cleanup() {
  local pid
  for pid in ${pids[@]+"${pids[@]}"}; do
    kill "$pid" 2>/dev/null || true
  done
  for pid in ${pids[@]+"${pids[@]}"}; do
    wait "$pid" 2>/dev/null || true
  done
  rmdir "$work_root/lock"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

run_dir="$(mktemp -d "$work_root/run.XXXXXX")"
mkdir -p "$run_dir/logs" "$run_dir/output" "$run_dir/merged"

# Read the supported languages from the actual config, keeping English first.
node > "$run_dir/locales" <<'NODE'
const {loadSiteConfig} = require('@docusaurus/core/lib/server/config');
loadSiteConfig({siteDir: process.cwd()}).then(({siteConfig: {i18n}}) => {
  for (const locale of [i18n.defaultLocale, ...i18n.locales.filter(l => l !== i18n.defaultLocale)]) {
    if (!/^[a-zA-Z0-9_-]+$/.test(locale)) throw new Error(`Invalid locale: ${locale}`);
    console.log(locale);
  }
}).catch(error => { console.error(error); process.exitCode = 1; });
NODE
locales=()
while IFS= read -r locale; do
  locales+=("$locale")
done < "$run_dir/locales"

next=0
finished=0
failed=0
echo "Building ${#locales[@]} languages, up to $jobs processes at once."
echo "Logs: $run_dir/logs"
while (( finished < ${#locales[@]} )); do
  while (( next < ${#locales[@]} && ${#pids[@]} < jobs )); do
    locale="${locales[$next]}"
    echo "[$locale] Starting"
    # Each worker needs its own generated-files directory, otherwise the
    # languages overwrite each other's modules. Webpack's persistent cache is
    # not keyed by that directory, so it also needs a cache of its own: sharing
    # node_modules/.cache with a plain `npm run build` makes one of the two
    # reuse loader output pointing at the other's directory, and every page
    # fails to resolve. See the separate-webpack-cache plugin in the config.
    DOCUSAURUS_GENERATED_FILES_DIR_NAME="$work_root/generated/$locale" \
      SEMAPHORE_DOCS_WEBPACK_CACHE_DIR="$work_root/webpack-cache" \
      SEMAPHORE_DOCS_DEV_PROXY=false \
      node scripts/build-locale.cjs "$locale" "$run_dir/output/$locale" \
      > "$run_dir/logs/$locale.log" 2>&1 &
    pids+=("$!")
    running_locales+=("$locale")
    next=$((next + 1))
  done

  active_pids=()
  active_locales=()
  for ((i = 0; i < ${#pids[@]}; i++)); do
    pid="${pids[$i]}"
    locale="${running_locales[$i]}"
    if kill -0 "$pid" 2>/dev/null; then
      active_pids+=("$pid")
      active_locales+=("$locale")
    else
      if wait "$pid"; then
        echo "[$locale] Done"
      else
        echo "[$locale] FAILED: $run_dir/logs/$locale.log" >&2
        tail -n 25 "$run_dir/logs/$locale.log" >&2
        failed=1
      fi
      finished=$((finished + 1))
    fi
  done
  pids=(${active_pids[@]+"${active_pids[@]}"})
  running_locales=(${active_locales[@]+"${active_locales[@]}"})
  if (( failed )); then
    echo 'Build failed; existing build/ was not changed.' >&2
    exit 1
  fi
  if (( finished < ${#locales[@]} )); then sleep 0.2; fi
done

# Each worker produces the normal locale layout: English at /, others at /<lang>/.
for locale in "${locales[@]}"; do
  cp -R "$run_dir/output/$locale/." "$run_dir/merged/"
done

# Replace the published directory only after every worker and the merge succeed.
if [[ -e build ]]; then mv build "$run_dir/previous-build"; fi
if ! mv "$run_dir/merged" build; then
  if [[ -e "$run_dir/previous-build" ]]; then mv "$run_dir/previous-build" build; fi
  exit 1
fi
rm -rf "$run_dir/output" "$run_dir/previous-build"
echo "All languages merged into $site_dir/build/"
