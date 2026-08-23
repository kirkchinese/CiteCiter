#!/usr/bin/env bash
set -euo pipefail

tarball=${1:?candidate tgz is required}
evidence_dir=${2:?evidence directory is required}
desktop_url='https://github.com/anywhere-labs/deepseek-harness-desktop/releases/download/v2.0.2/DSH.Desktop-2.0.2-universal.dmg'
desktop_sha256='35b40819b8ebfb0adfae232147ecb1f7199693fc331d049e436156aac7ccec45'
dmg="$RUNNER_TEMP/DSH.Desktop-2.0.2-universal.dmg"
mount_point="$RUNNER_TEMP/dsh-desktop-mount"
app_path="$RUNNER_TEMP/Applications/DSH Desktop.app"
app_exe="$app_path/Contents/MacOS/DSH Desktop"
resources="$app_path/Contents/Resources/app.asar.unpacked"
bootstrap="$resources/lib/desktop-cli.js"
dsh_home="$RUNNER_TEMP/dsh-home"
profile_dir="$dsh_home/profiles/desktop"
settings_path="$dsh_home/settings.yaml"
playwright_root="$RUNNER_TEMP/playwright-core"
user_data_dir="$HOME/Library/Application Support/DSH Desktop"
runtime_commands="$user_data_dir/runtime-commands/bin"
runtime_pnpm="$runtime_commands/pnpm"
install_recovery_state="$user_data_dir/plugin-install-recovery/state.json"
export DSH_HOME="$dsh_home"
export DSH_DESKTOP_DEFAULT_PROFILE=desktop
export DSH_DESKTOP_INSTALL_RECOVERY_STATE_PATH="$install_recovery_state"
export PLAYWRIGHT_CORE_ROOT="$playwright_root"

mkdir -p "$evidence_dir" "$dsh_home" "$(dirname "$app_path")"

install_desktop() {
  if [[ ! -f "$dmg" ]]; then
    curl -fL --retry 3 --retry-all-errors "$desktop_url" -o "$dmg"
    [[ "$(shasum -a 256 "$dmg" | awk '{print $1}')" == "$desktop_sha256" ]]
  fi
  mkdir -p "$mount_point"
  hdiutil attach "$dmg" -mountpoint "$mount_point" -nobrowse -readonly
  ditto "$mount_point/DSH Desktop.app" "$app_path"
  hdiutil detach "$mount_point"
  rmdir "$mount_point"
  lipo "$app_exe" -verify_arch x86_64 arm64
  codesign --verify --deep --strict --verbose=2 "$app_path"
  spctl --assess --type execute --verbose=4 "$app_path"
  xcrun stapler validate "$app_path"
}

uninstall_desktop() {
  case "$app_path" in
    "$RUNNER_TEMP"/Applications/*.app) rm -rf -- "$app_path" ;;
    *) echo "refusing to remove unexpected app path: $app_path" >&2; return 1 ;;
  esac
  [[ ! -e "$app_path" ]]
}

stop_desktop() {
  local pid=$1
  if kill -0 "$pid" 2>/dev/null; then
    kill -TERM "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.1
    done
    kill -KILL "$pid" 2>/dev/null || true
  fi
  wait "$pid" 2>/dev/null || true
}

initialize_desktop_runtime() {
  local pid ready=0
  "$app_exe" --remote-debugging-port=19221 --disable-gpu >"$evidence_dir/00-bootstrap-desktop.stdout.log" 2>"$evidence_dir/00-bootstrap-desktop.stderr.log" &
  pid=$!
  for _ in $(seq 1 360); do
    if [[ -x "$runtime_pnpm" && -f "$profile_dir/package.json" ]] \
      && curl -fsS --max-time 2 http://127.0.0.1:19221/json/list | grep -Eq '"url"[[:space:]]*:[[:space:]]*"http://127\.0\.0\.1:[0-9]+/'; then
      ready=1
      break
    fi
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.25
  done
  stop_desktop "$pid"
  [[ $ready -eq 1 ]] || { echo 'Desktop did not materialize its runtime commands, profile, and renderer target' >&2; return 1; }
}

desktop_dsh() {
  ELECTRON_RUN_AS_NODE=1 "$app_exe" --expose-internals "$bootstrap" "$@"
}

assert_install_recovery() {
  local label=$1
  [[ -f "$install_recovery_state" ]] || { echo "Desktop CLI did not create its install recovery WAL after $label" >&2; return 1; }
  node -e "const s=JSON.parse(require('node:fs').readFileSync(process.argv[1],'utf8'));if(s.profileName!=='desktop'||s.phase!=='awaiting-restart')throw new Error(JSON.stringify(s))" "$install_recovery_state"
  cp "$install_recovery_state" "$evidence_dir/$label-install-recovery.json"
}

prepare_fixture() {
  local package_json dev_dir
  package_json=$(node -e "const{createRequire}=require('node:module');const{join}=require('node:path');console.log(createRequire(join(process.argv[1],'package.json')).resolve('@kirkchinese/dsh-citeciter/package.json'))" "$profile_dir")
  dev_dir="$(dirname "$package_json")/dev"
  mkdir -p "$dev_dir"
  cp "$script_dir/../packages/citeciter/dev/fake-llm.mjs" "$dev_dir/fake-llm.mjs"
  cat > "$profile_dir/cordis.patch.yml" <<'YAML'
- insert:
    - id: citeciter-fixture-llm
      name: ./node_modules/@kirkchinese/dsh-citeciter/dev/fake-llm.mjs
YAML
}

set_desktop_settings() {
  local mode=$1 port=$2
  cat > "$settings_path" <<YAML
dsh-desktop:
  mode: $mode
  port: $port
YAML
}

run_ui() {
  local debug_port=$1 action=$2 expected_port=$3 label=$4 pid exit_code=0
  "$app_exe" "--remote-debugging-port=$debug_port" --disable-gpu >"$evidence_dir/$label-desktop.stdout.log" 2>"$evidence_dir/$label-desktop.stderr.log" &
  pid=$!
  if ! node "$script_dir/desktop-ui.mjs" "http://127.0.0.1:$debug_port" "$action" "$expected_port" "$evidence_dir/$label.json" "$evidence_dir/$label.png"; then
    exit_code=1
  fi
  stop_desktop "$pid"
  [[ $exit_code -eq 0 ]]
}

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
install_desktop
trap '[[ ! -e "$app_path" ]] || uninstall_desktop' EXIT

set_desktop_settings compatibility 43189
initialize_desktop_runtime
export PATH="$runtime_commands:$PATH"
[[ "$(command -v pnpm)" == "$runtime_pnpm" ]]
printf 'DSH_BOOTSTRAP=%s\nDEFAULT_PROFILE=%s\nINSTALL_RECOVERY_STATE=%s\nPATH[0]=%s\n' \
  "$bootstrap" "$DSH_DESKTOP_DEFAULT_PROFILE" "$install_recovery_state" "$runtime_commands" \
  > "$evidence_dir/macos-runtime-environment.txt"

node_version=$(ELECTRON_RUN_AS_NODE=1 "$app_exe" -p 'process.version')
node_arch=$(ELECTRON_RUN_AS_NODE=1 "$app_exe" -p 'process.arch')
pnpm_version=$(pnpm --version)
dsh_version=$(desktop_dsh --version)
printf 'Node %s (%s)\npnpm %s\nDSH %s\n' "$node_version" "$node_arch" "$pnpm_version" "$dsh_version" > "$evidence_dir/macos-runtime-versions.txt"
[[ "$pnpm_version" == '11.7.0' && "$dsh_version" == *'0.1.1-rc.2'* ]]
case "$(uname -m):$node_arch" in
  arm64:arm64|x86_64:x64) ;;
  *) echo "packaged runtime architecture $node_arch does not match $(uname -m)" >&2; exit 1 ;;
esac

desktop_dsh plugin add '@kirkchinese/dsh-citeciter@0.4.0' > "$evidence_dir/install-0.4.0.txt"
assert_install_recovery 0.4.0
prepare_fixture
source_workspace=$(cd -- "$script_dir/.." && pwd)
node "$script_dir/../packages/citeciter/dev/seed-smoke-session.mjs" "$dsh_home" "$source_workspace" > "$evidence_dir/seed.json"
set_desktop_settings compatibility 43189
run_ui 19222 create-compatibility 43189 01-compatibility-0.4.0

candidate_tarball="$(cd "$(dirname "$tarball")" && pwd)/$(basename "$tarball")"
desktop_dsh plugin add "$candidate_tarball" > "$evidence_dir/upgrade-0.4.1.txt"
assert_install_recovery candidate-upgrade
prepare_fixture
desktop_dsh plugin list --depth 0 > "$evidence_dir/candidate-list.txt"
desktop_dsh --dump-config > "$evidence_dir/candidate-dump-config.txt"
set_desktop_settings compatibility 43189
run_ui 19223 verify-compatibility 43189 02-candidate-compatibility
set_desktop_settings advanced 43189
run_ui 19224 verify-advanced 43189 03-advanced-fixed

set_desktop_settings advanced 0
run_ui 19225 verify-advanced random 04-advanced-random

uninstall_desktop
[[ -d "$dsh_home/citeciter" ]]
install_desktop
set_desktop_settings advanced 43189
run_ui 19226 verify-advanced 43189 05-app-reinstall

desktop_dsh plugin remove '@kirkchinese/dsh-citeciter' > "$evidence_dir/plugin-remove.txt"
[[ -d "$dsh_home/citeciter" ]]
desktop_dsh plugin add "$candidate_tarball" > "$evidence_dir/plugin-reinstall.txt"
assert_install_recovery candidate-reinstall
prepare_fixture
run_ui 19227 verify-advanced 43189 06-plugin-reinstall
