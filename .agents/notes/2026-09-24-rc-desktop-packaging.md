# RC baseline and Desktop module packaging

Status: implemented and partially accepted; not a release approval.

## Decisions

Compile the 0.9 candidate against resolved DSH 0.1.7-rc.1 packages. Install upstream dsh-codex-connect 0.1.0-alpha.4.46 in the main Web profile; retire the active local connector patch. Preserve the earlier alpha compatibility record as historical evidence, not current installation guidance.

Desktop 2.0.13 still bundles DSH 0.1.5-rc.2. Keep the current desktop plugin on 0.8.2 and apply a local 0.8.2+desktop.2 packaging fix rather than claiming the RC candidate supports that host. User choice of a full Desktop compatibility build versus awaiting a newer bundled host remains pending.

## Module resolution fix

The installed Desktop uses resources/app, while host-agent-modules.ts assumed resources/app.asar. The native UI reproduced a missing dsh-agent-loop module error. Resolve the desktop package anchor in app then app.asar order, checking package.json and surfacing failures other than ENOENT. Electron can report an invalid-package error when probing a nonexistent asar before an existing unpacked app, so the order is intentional. Preserve virtual asar paths; CLI entry resolution continues to use realpath for symbolic links.

The fix is isolated to the host module adapter. No host Agent Loop or native session storage is patched. The local stable backport replaces only the compiled module-loading implementation and its access import; it does not add 0.9 interfaces to the old desktop host.

## Evidence and limits

Typecheck, full build, packing, main-profile installation and git diff --check passed. Native Desktop restarted successfully after the fix; a new real-model question submitted with Enter returned an answer, reasoning disclosure and follow-up suggestions. Main Web with the official connector generated and displayed a real PNG on the first attempt. See docs/validation/2026-09-24-rc.md for the environment and observed boundaries.

Native resize and download acceptance remain incomplete. A combined real-model shell/board request was still running at the last observation. Computer Use ended the turn because it could not confidently identify the active browser URL on Windows. Automatic approval separately rejected cleanup of an owned temporary file despite user authorization. Neither restriction was bypassed. No release, push or commit was performed.
