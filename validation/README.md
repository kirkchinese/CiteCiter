# Desktop 2.0.2 candidate workflow draft

This draft validates CiteCiter commit `ee682e6f0dbc43ba602ee031964db8237eff4c3b` and only accepts the tarball whose SHA-256 is `9dd621452ba17bed382f756901f4ea5f8d1d53b172a84d7f62701ca28ada1c80`.

## Current facts

- `ee682e6` is the frozen package commit on `validation/citeciter-0.4.1-advanced-fix`; later commits on this validation-only branch change only the hosted gate.
- Repository Actions are enabled, all actions are allowed, default workflow permissions are read-only, and the current GitHub token has `repo` and `workflow` scopes.
- Repacking the committed files with pnpm 11.21.0 and `--config.ignore-scripts=true` reproduced the frozen tarball byte-for-byte: 296629 bytes and the expected SHA-256 above.
- DSH Desktop v2.0.2 assets are pinned to the upstream release at commit `9d18856ddea4f20eb3ef8c88b0436921c6b19606`:
  - Windows x64 Setup: 132417238 bytes, SHA-256 `b31f63f8cf70d3fc07ed2ae36e5de7b1939e604bdb3be097de3383a82a06a787`.
  - macOS universal DMG: 279906483 bytes, SHA-256 `35b40819b8ebfb0adfae232147ecb1f7199693fc331d049e436156aac7ccec45`.
- Desktop source defaults to port 43120 and retries 32 sequential ports. Its user guide says the default is port 0. The workflow avoids treating either statement as acceptance evidence: it explicitly writes port 43189 for fixed-origin tests and port 0 for random-port tests.
- The v2.0.2 launcher creates `runtime-commands/bin` for packaged pnpm. On Windows it also creates `host-commands/desktop/bin/dsh.cmd`; that shim sets `DSH_DESKTOP_DEFAULT_PROFILE=desktop`, `DSH_HOME`, and `DSH_DESKTOP_INSTALL_RECOVERY_STATE_PATH`. The macOS job invokes the same packaged `desktop-cli.js` with the terminal-owned environment hand-off because opening the native tray terminal is an interactive-only gate.

## What the workflow proves

The Ubuntu staging job reconstructs the candidate from the exact committed package files, rejects any other digest, checks the package manifest, requires the packed selector `[data-citeciter-docked]>:has(+[data-shell-overlay])`, and rejects a docked `:nth-child(...)` selector. The same tgz is transferred once through a GitHub Actions artifact to all platform jobs.

The Windows x64 and both native macOS architectures then verify the official Desktop asset digest, install/copy Desktop 2.0.2, inspect its bundled Node/pnpm/DSH versions, and exercise the packaged Desktop CLI. They first wait for a real loopback renderer target and Desktop's generated runtime-command directory. Windows invokes the generated `dsh.cmd`; macOS invokes the packaged bootstrap with the exact default-profile and install-recovery environment used by its generated terminal. Every plugin add must leave an `awaiting-restart` recovery WAL for profile `desktop`. Each platform then runs this sequence against an isolated `DSH_HOME`:

1. install CiteCiter 0.4.0, create two deterministic Topics in compatibility mode on fixed port 43189, then select the older non-most-recent Topic;
2. upgrade to the exact candidate tgz;
3. launch the candidate in compatibility mode on fixed port 43189, prove the older Topic is restored instead of the most-recent fallback, keep the source conversation visible, and reject renderer console errors;
4. launch Advanced mode on fixed port 43189 and prove the same exact Topic pointer is restored;
5. assert against the actual AdvancedFrame DOM that the caption and conversation are visible, the details occupant immediately before `[data-shell-overlay]` is hidden, any rendered details resize handle is hidden, and the conversation does not overlap the CiteCiter panel;
6. repeat Advanced mode with explicitly configured port 0 and prove the new origin falls back to the most-recent Topic;
7. uninstall/reinstall Desktop while retaining the Topic;
8. remove/reinstall CiteCiter while retaining and reopening the Topic.

The macOS matrix runs the same universal DMG natively on `macos-15` and `macos-15-intel`, verifies both main-executable architecture slices, and runs the upstream-equivalent code-signing, Gatekeeper, and stapling checks. Each job uploads screenshots, renderer facts, CLI output, logs, runtime versions, and installer/signature evidence even after failure.

## How to run it

Copy `.github/workflows/desktop-candidate.yml` and `validation/` onto `validation/citeciter-0.4.1-advanced-fix`, whose history must contain `ee682e6`, then commit and push only that branch. The exact branch-scoped `push` trigger is required because GitHub does not discover a newly added `workflow_dispatch` workflow only from a non-default branch. Keep `workflow_dispatch` for reuse if the workflow later exists on the default branch. Do not copy these files to `main` merely to run the gate. The workflow has `contents: read`, uses no secrets, pins every action by commit SHA, and does not publish anything.

## What GitHub-hosted runners cannot prove

This is not enough for GO. Silent NSIS installation and direct DMG copying do not exercise the interactive installer, UAC, SmartScreen, Finder drag/replace, or first-launch Gatekeeper UI. CDP observes the real packaged renderer but cannot validate native caption dragging, Mica/vibrancy, tray behavior, the tray-opened terminal, normal tray Quit, resize feel, DPI/multiple-monitor behavior, or interaction with unrelated installed plugins. Hosted runs terminate Electron after evidence capture; process exit is deliberately not a gate. The deterministic fixture is not a real provider, real project, or real long-running Topic; runner cold-start timings are diagnostic only. The screenshots are renderer screenshots, not full native-window captures, and GitHub Actions cannot use the in-app Browser plugin. Interactive Windows x64 and Intel/Apple-Silicon macOS acceptance remains required before GO.
