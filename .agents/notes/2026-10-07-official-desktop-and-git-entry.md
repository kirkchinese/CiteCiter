# Official Desktop and Git repository installation

Date: 2026-10-07. Candidate: CiteCiter 0.9.0-alpha.4. This work changes the supported Desktop target to the official DeepSeek Harness application. It does not publish a release or establish complete functional acceptance.

## Ownership and removal decision

The user explicitly withdrew community Desktop support and requested removal of its repository content and acceptance evidence. This overrides the normal freeze on archived Agent Notes for that material. Community-only startup code and notes are removed; mixed documents retain only their independent Web observations, general engineering decisions and release facts. Community Desktop observations are not evidence for the official application. Git history is preserved, and source sessions, Citer-owned logs, migration backups and original video material are not deletion targets.

The installed community application was uninstalled. The official signed Windows installer reports 0.2.0-rc.2 and installs at the vendor's DeepSeek Harness path. The main DSH home remains in place. The obsolete community desktop-shell profile entry was removed after backing up profile configuration. Old ignored community caches, installer copies and source copies could not be deleted because automatic approval rejected the bounded PowerShell cleanup with only `blocked by policy`; this was not bypassed through another tool.

## Engineering decisions

The canonical package remains in packages/citeciter. The repository root now declares a real Git-installable plugin using the same committed lib files, exports and bundle patch. A synchronization/check command derives root metadata from the canonical package. Root build commands use explicit directory selection to avoid recursively running both identically named workspace packages. Git installation requires no prepare hook, nested file dependency or redirect to a previously published npm version. npm packing still targets the canonical inner package.

The primary SDK is 0.2.1-alpha.1; the separately pinned official Desktop SDK gate is 0.2.0-rc.2. Obsolete settings, icon, preview and Typert fallbacks were removed while keeping those boundaries modular. Runtime modules resolve from the actual official app/dsh or app.asar/dsh installation; CLI entry points still resolve symlinks. Update commands use the public profileContext name, without a community-only service.

Layout measures the official content row, preserving Windows chrome, native details and alpha's bottom slot. Topic questions follow the official dismiss, foreground wait and late-answer contracts while remaining outside the Host Session list. A real user late reply restores an archived Topic just as another manual send does. See the separate question-adapter note for lifecycle decisions and limits. No Host Agent Loop or persisted DSH log format was rewritten.

## Evidence and limits

Root metadata checks, dependency peer checks, both Host/Client SDK gates, build, packing and whitespace checks passed. The official pnpm 11.7 Git fetcher and official DSH plugin manager installed a local real Git snapshot as the actual Citer bundle; public GitHub installation after pushing remains unverified. Final artifact hashes and installation comparison belong to the linked acceptance record, not to a version number alone: pnpm can reuse an earlier tarball from an unchanged file URL, so candidates are installed from content-distinct filenames and compared byte for byte.

The official native window was actually opened and showed CiteCiter's launcher. Codex Connect was updated to 0.2.0-alpha.2. The final candidate's native restart and real-model flows are not accepted yet. After the user reported closing the modal and requested Computer Use recovery, the JavaScript session was reset; the new sky.list_windows call still returned the physical-Escape stop condition. No further native input was issued that turn. This control limitation must not be reported as a product pass or a proven new user keypress.

README positioning and the bilingual X text/image kit are prepared, with conceptual graphics explicitly distinguished from screenshots and Super mode described as a future opt-in direction. Nothing was posted publicly. Linux and macOS have no new real-machine acceptance in this round.

Continue from [the official acceptance record](../../docs/validation/2026-10-07-official-desktop.md) and [upstream audit](../../docs/compatibility/2026-10-official-desktop-audit.md). Do not reuse removed community evidence to fill the remaining matrix.
