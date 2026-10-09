# Changelog

All notable changes to CiteCiter. Detailed notes for each published version are on [GitHub Releases](https://github.com/kirkchinese/CiteCiter/releases). Versions are listed with the DSH host line they target.

## Unreleased — 0.9.0-beta.1

Targets the official DSH Desktop `0.2.0-rc.2` and DSH `0.2.1-alpha.1`. Includes everything from the unpublished 0.9.0-alpha.4 candidate.

### Host support

- Support the official DeepSeek Harness Desktop `0.2.0-rc.2` and DSH `0.2.1-alpha.1`. Earlier npm versions are refused by these hosts' compatibility gate ([#13](https://github.com/kirkchinese/CiteCiter/issues/13)). Community desktop builds are no longer supported.
- The repository root is now an installable plugin entry, so `dsh plugin add git+https://github.com/kirkchinese/CiteCiter.git#<ref>` and the Desktop plugin page's Git field work without a build step.
- Load shared DSH modules through the host's profile resolution. This fixes Topics that failed to restore on some official Desktop launch paths.

### Question cards and drafts

- Unsent answers to `ask_user_question` cards are saved per Topic, including choices, free text and the current page, and survive reloads and restarts. After a host restart an interrupted card is restored and waits for a manual answer; cancelled or stopped questions are not restored.
- Paging and submitting are separate buttons, so "Next" can no longer submit the whole card.
- Drafts save silently. Edits from several windows merge automatically; overlapping edits keep the window you are typing in. IME composition is never interrupted by a remote save.

### Tools, deletion and UI

- Tool calls, including PTC sub-calls, show success, failure, cancellation, interruption and explicit approval rejection. Question replies render as readable user messages.
- Permanent deletion writes a minimal receipt (identity and cleanup state only), so other windows release the Topic and late requests cannot recreate it.
- The image preview close button avoids the official Desktop title bar. Draft images that cannot be decoded show "无法预览" and keep the original file.
- A model failure already shown in the transcript no longer repeats as a banner.
- Appending to an existing Topic from the wheel focuses the composer once the panel is laid out.
- Board citations keep the text inside SVG and HTML diagrams.

### Removed

- The private Topic runtime used by versions before 0.8, together with Exact Fork mode. Every Topic is now a native DSH Session in its source's `citeciter/` directory. Topics still stored in the pre-0.8 layout are migrated automatically at startup when their source is available; the original logs are kept.
- Settings that no longer had an effect: default Topic mode, "allow investigating the source workspace" (applied only to pre-0.8 Topics), prompt templates and the wheel slot's content type. Values saved by earlier versions are ignored, and an invalid saved value now falls back to its default without resetting the other settings.
- The `select-model` request and the 0.3.1 `citation` create request.
- Nine DSH peer dependencies that only the private runtime used, so the host compatibility check has fewer packages to match.

## 0.9.0-alpha.3 — 2026-09-28

Targets DSH Web `0.1.7-rc.2`.

- Fix IME composition in the Topic composer (typing `ni` could produce `nni你`). Loaded drafts update synchronously; saving stays in the background.
- Remove the flickering "saving draft" text; save failures still surface.

## 0.9.0-alpha.2 — 2026-09-28

- Update checks understand prerelease versions, so an alpha `latest` tag no longer reports `registry-version-invalid`.

## 0.9.0-alpha.1 — 2026-09-28

Targets DSH Web `0.1.7-rc.2`.

- Fix installation and Typert activation on DSH `0.1.7-rc.2` ([#9](https://github.com/kirkchinese/CiteCiter/issues/9)).
- Drafts (text, references and attachment bytes) persist per Topic and restore after refresh or restart without sending.
- Free questions append to the selected, unarchived Topic; other built-in wheel actions create a new Topic. Wheel actions open the composer directly.
- Images and files from tools render under the tool card; history images open in the host lightbox.
- Learning-card examples distinguish prose from code; the learning route is off by default.
- Board screenshots work after the panel closes; archived Topics restore when a new message is accepted.
- A Topic may cite several documents; document tools report exact ranges and continuation offsets.

## 0.8.2 — 2026-09-14

Targets DSH Web `0.1.5-rc.1`.

- `read_source_session` reports `sourceMaxSeq`, `hasMore`, `nextFromSeq` and `readScope`, so models no longer mistake a short window for the whole source.
- Restore the three suggested follow-up questions after a native Topic's first answer.

## 0.8.1 — 2026-09-14

- Fix Topics failing to open on Linux when the DSH launcher is a symlink. 0.8.0 is deprecated.

## 0.8.0 — 2026-09-14 (deprecated)

Targets DSH Web `0.1.5-rc.1`. Includes the unpublished 0.7.0 betas.

- New Topics are native DSH sessions stored under the source session's `citeciter/` directory, using the host's agent preset, models, permissions, attachments, queue and approvals. Older Topics are migrated with their original logs kept.
- Creating a Topic or choosing a wheel action only prepares a draft; the model runs after a manual send. Source and excerpt references are removable draft attachments.
- New Topics are read-only by default.
- Eight-slot selection wheel, native file-preview entry, floating/docked panel, learning cards with Markdown export, optional learning route and active recall.
- `blackboard_view` lets vision models inspect the rendered board.

## 0.6.0 — 2026-09-07

Targets DSH Web `0.1.2-rc.1` on Windows.

- Adapt to the new session, sandbox, question and client APIs; Host and Client compile separately.
- The panel keeps a readable main conversation, moves below it in narrow windows and restores the host layout on close.

## 0.5.0 — 2026-09-03

Targets DSH Web `0.1.1-rc.1` / `0.1.1-rc.2`.

- Free Topics without a citation, Presenter blackboard (protocol v4), document Reader, tool-result citations, permanent deletion and update notices.

## 0.4.3 — 2026-08-28

- Restore citing committed intermediate model calls and reasoning text (regressed in 0.4.2).

## 0.4.2 — 2026-08-28

- Fix selections in lists and nested lists that could not be mapped back to the answer.

## 0.4.1 — 2026-08-26

- Fix leaked follow-up markup, stalled pagination on oversized source events and duplicate work on retries.

## 0.4.0 — 2026-08-22

- Move to DSH `0.1.1-rc.1` / `0.1.1-rc.2`.

## 0.3.2 — 2026-08-22

- Reliability fixes for selection mapping, Topic creation, model switching and lists. Targets DSH Web `0.1.0-rc.7`.

## 0.3.1 — 2026-08-21

- Read-only `glob` / `grep`, structured user questions and expandable tool rows.

## 0.3.0 — 2026-08-21

- Private Observer Topics: cite a committed model call while the source agent keeps running.

## 0.2.1 — 2026-08-18

- Fix later follow-ups being rejected after the read-only switch.

## 0.2.0 — 2026-08-18

- Durable Citation Threads with custom questions and follow-ups.

## 0.1.1 — 2026-08-17

- Add the DSH bundle declaration so `dsh plugin add` mounts the plugin.

## 0.1.0 — 2026-08-17

- First release: explain a selected passage of a DSH Web answer in a side panel.
