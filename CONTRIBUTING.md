# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

Use Node.js `^22.19.0 || >=24.0.0`, pnpm `11.21.0` and DSH `0.1.5-rc.1`. Windows validation uses Node 24.19.0. Desktop 2.0.9 embeds this DSH release; Desktop master and DSH alpha are different targets.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm test:snapshot
git diff --check
```

The package is in `packages/citeciter/`. Host and Client compile separately. Generated `lib/` is tracked and must be rebuilt. `pnpm --dir packages/citeciter dev` watches both TypeScript programs and the client bundle through Node directly, including on Windows.

## Development profile

Start an independent PowerShell shell:

```powershell
$env:DSH_HOME = Join-Path $PWD '.refs/manual-web'
dsh plugin --profile web add "$PWD/packages/citeciter"
dsh --profile web --host 127.0.0.1 --port 10519 --no-open
```

For the first Web visit, open the complete login URL printed by the host, including `?token=…`. DSH sets a session cookie and redirects to the URL without the token; subsequent reloads can use that address. Omitting the initial login parameter returns HTTP 401, which some browser automation tools report as `ERR_BLOCKED_BY_CLIENT` for this text response. Treat the login URL as a host credential; do not copy it into documentation or Git.

Choose a free port and a home owned by no other process. Launch Desktop with a separate `DSH_HOME`, then run `dsh plugin add <absolute source directory or tarball path>` in its managed terminal. That terminal selects the bundled CLI, current profile and home; the global CLI cannot manage the reserved `desktop` profile. Updating the global CLI does not update Desktop's embedded runtime. Restart the host after Host changes and refresh the page after Client changes.

## Assembled snapshot and packaging

`pnpm test:snapshot` needs the global DSH CLI. It creates a fresh temporary home, installs CiteCiter and mounts a deterministic model. Real source, Observer and Exact Fork loops exercise the five stages, boards and cards against `tests/snapshots/assembled-topic.json`. Additional checks use the public command boundary for Topic management, stop/failure recovery, model questions, repeated card generation and long-document last-page citations, while verifying the unchanged source log. A second boot checks restoration. No API key is needed. The printed artifact directory remains available for inspection.

The runner checks the installed DSH package version before creating a profile. If the global CLI uses another version, set `CITECITER_DSH_BIN` to the absolute `@deepseek-ai/dsh/lib/bin.js` path of a separate 0.1.5-rc.1 installation. This also selects the runtime for the packed smoke; it does not change the global installation.

After reviewing an intentional output change, record with `CITECITER_RECORD_SNAPSHOT=1` in that command's environment, then remove the variable and replay. Never record just to make a failure pass.

```powershell
pnpm --dir packages/citeciter pack --pack-destination "$PWD/.refs/artifacts"
node packages/citeciter/dev/run-smoke.mjs .refs/artifacts/kirkchinese-dsh-citeciter-0.7.0-beta.3.tgz
```

The old `dev/seed-smoke-session.mjs`, `smoke*.mjs` and `hmr-smoke.mjs` are historical 0.5 fixtures with handwritten old-host logs and Linux paths. They are not the 0.6 acceptance path. Use the assembled snapshot and an isolated real UI session; do not run the old seeder against user data.

## Review

Preserve source Sessions and read-only Topic tools. Keep public UI registration separate from the version-specific layout adapter. Exercise maximum width, narrow windows, native details, close/reopen and Desktop modes.

For Codex on Windows, read the installed Computer Use skill and use its dedicated node_repl / @oai/sky API for native Desktop checks. A browser-only unified CUA configuration does not establish that native control is unavailable. Select returned app/window objects, refresh state after UI changes and verify the rendered result before retrying input. Do not edit generated plugin manifests or invoke private helper protocols. See the [native control validation](.agents/notes/2026-09-12-native-control-recovery.md).

Update root/package READMEs, releases and JSDoc together. Nontrivial decisions belong in `.agents/notes/`, an explicit exception to excluding transient design drafts and local QA artifacts. Do not commit credentials, temporary homes, screenshots or tarballs. Report only checks actually run and distinguish Windows evidence from untested platforms.

Contributions use the [MIT License](LICENSE).
