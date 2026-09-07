# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

Use Node.js `^22.19.0 || >=24.0.0`, pnpm `11.21.0` and DSH `0.1.2-rc.1`. Windows validation uses Node 24.19.0. Desktop 2.0.5 embeds this DSH release; Desktop master and DSH alpha are different targets.

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

Choose a free port and a home owned by no other process. For Desktop use another `DSH_HOME`, install into the profile selected in Desktop, and launch the installed executable from that environment. Updating the global CLI does not update Desktop's embedded runtime. Restart the host after Host changes and refresh the page after Client changes.

## Assembled snapshot and packaging

`pnpm test:snapshot` needs the global DSH CLI. It creates a fresh temporary home, installs CiteCiter and mounts a deterministic model. Real source, Observer and Exact Fork loops exercise source reading and board tools; their transcript is compared with `tests/snapshots/assembled-topic.json`. It also asserts that the source log remains unchanged. No API key is needed. The printed artifact directory remains available for inspection.

After reviewing an intentional output change, record with `CITECITER_RECORD_SNAPSHOT=1` in that command's environment, then remove the variable and replay. Never record just to make a failure pass.

```powershell
pnpm --dir packages/citeciter pack --pack-destination ../../.refs/artifacts
node packages/citeciter/dev/run-smoke.mjs .refs/artifacts/kirkchinese-dsh-citeciter-0.7.0-beta.1.tgz
```

The old `dev/seed-smoke-session.mjs`, `smoke*.mjs` and `hmr-smoke.mjs` are historical 0.5 fixtures with handwritten old-host logs and Linux paths. They are not the 0.6 acceptance path. Use the assembled snapshot and an isolated real UI session; do not run the old seeder against user data.

## Review

Preserve source Sessions and read-only Topic tools. Keep public UI registration separate from the version-specific layout adapter. Exercise maximum width, narrow windows, native details, close/reopen and Desktop modes.

Update root/package READMEs, releases and JSDoc together. Nontrivial decisions belong in `.agents/notes/`, an explicit exception to excluding transient design drafts and local QA artifacts. Do not commit credentials, temporary homes, screenshots or tarballs. Report only checks actually run and distinguish Windows evidence from untested platforms.

Contributions use the [MIT License](LICENSE).
