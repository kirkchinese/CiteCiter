# CiteCiter

[简体中文](README.zh.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

CiteCiter adds a source-aware workspace to DeepSeek Harness. Create independent Topics from conversations, tool results and documents for text, programming, image and learning tasks. New Topics use native DSH Sessions, permissions, models, attachments and message queues. The source conversation continues independently.

![Native Citer workspace and manual submission diagram](https://raw.githubusercontent.com/kirkchinese/CiteCiter/codex/learning-workspace-0.7/assets/docs/native-workspace.svg)

This is an interaction diagram, not a screenshot. Selection actions prepare drafts; model work begins only after the user sends.

## Version and installation

This branch is **0.8.0-alpha.1, an unpublished development candidate**. Baseline: DSH `0.1.5-rc.1`, [DSH Desktop](https://github.com/anywhere-labs/dsh-desktop) `2.0.9`, Node.js `^22.19.0 || >=24.0.0`. Windows acceptance uses Node 24.19.0. DSH next, alpha and TUI are separate targets.

| Version | Status | Main differences |
| --- | --- | --- |
| 0.8.0-alpha.1 | This branch; unpublished | Native Sessions, manual drafts, DSH permissions, attachments, queue and AI learning plans |
| 0.7.0-beta.3 | Previous development candidate | Private read-only Topics, selection wheel, manual five-stage learning |
| 0.6.0 | Published | DSH 0.1.2-rc.1 / Desktop 2.0.5 baseline |

Update the host CLI and install the published package:

```powershell
npm install -g @deepseek-ai/dsh@latest
dsh plugin --profile web add @kirkchinese/dsh-citeciter
dsh web
```

This installs the version currently published on npm, not the unpublished 0.8 features. If npm blocks native dependency installation scripts, follow its output to allow the named dependencies and reinstall. Do not disable script restrictions globally.

Build and install this branch locally:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
dsh plugin --profile web add E:/project/CiteCiter/.refs/artifacts/kirkchinese-dsh-citeciter-0.8.0-alpha.1.tgz
```

Desktop bundles its own DSH. Update the Desktop application, then run `dsh plugin add <absolute package path>` in its managed terminal. Updating the global CLI does not update Desktop's embedded runtime. Restart the relevant host after installation. Do not run Web and Desktop writers against the same DSH home simultaneously.

## Drafts and references

1. Select text in the source conversation, hold the right mouse button, point at a wheel action and release. Tool results, the document reader and native file previews provide additional entry points.
2. Citer opens an independent draft. Source conversation/document addresses and selected excerpts appear as removable attachments. Document chips show the filename; expand them to inspect the original path and snapshot address. Click × to remove a reference; the attachment menu can add sources and excerpts again.
3. Review the question, references, permissions and model, then click Send or press Enter. Shift + Enter inserts a newline; Enter during IME composition does not submit.

Creating Topics, choosing wheel actions, changing models and quoting boards do not call a model. Actions that need a question first show an input and model choice. Other actions fill a preset question and still require manual Send. Submitted mode prompts and reference contents are recorded in the Topic's native log.

Removing an unsent source attachment makes its reading tool reject access; new Topics do not silently inherit source history. Previously sent references remain in conversation history: removing a later draft copy does not retract them. Drafts survive panel close/reopen, Topic switches and window blur; browser reload or client exit does not retain unsent drafts or local attachments.

## Permissions, input and queue

New Topics start **read-only**, even when their source has full access. The input's permission menu selects native DSH read-only, workspace-write or full-access mode. Modification requires an explicit user mode choice or changed new-Topic default. DSH approval, sandbox and tool policies remain active.

Input controls are attachments, permission mode, model/reasoning and Send. Choose the model first, then one of its supported reasoning levels. Images and generic files use native DSH attachment services, with upload state and retry. A failed submission retains the draft.

While a reply runs, Enter and Send follow DSH's busy-send preference; Ctrl + Enter temporarily uses the other delivery mode. Queued messages run after the current turn; steering is admitted at its next step. The composer toggle overrides the current Topic without changing the host default. Pending rows can be removed or changed to steering. Stop ends the response and preserves existing output; pending work follows DSH's queue rules.

New Topics use standard programming tools under DSH permissions. Existing records retain their conversation and permissions when migrated into the source directory. Migration verifies every event; records that cannot be verified stay in their original store with an error report. Permissions are not expanded automatically.

Model-provided reasoning appears in an expandable Thinking row. While reasoning is streaming before the answer, the row shows Thinking in progress. Collapsed rows retain a one-line preview; expanding displays the full Markdown. Models that return no reasoning do not produce an empty row.

## Learning, boards and images

Learning route is off by default. When enabled, a submitted question asks the model to select and maintain a plan through DSH `todo_write`. It may use underlying logic, qualitative analysis, quantitative board work, concept connections and summary cards as needed; users do not click through stages individually.

The board appears once, in the host conversation's blackboard tab. It supports text, Markdown, math, tables, SVG, images and isolated HTML. Quoting adds a draft attachment; math renders as math rather than raw object fields. Read, export and revise cards in Citer's Cards view.

`blackboard_view` returns a browser-rendered PNG to an image-capable model, allowing it to inspect clipping, labels, arrows and layout before updating the board. When its tab is closed, the same component renders offscreen. Keep Citer open during capture. Sandboxed HTML iframes cannot be captured; use SVG for inspectable diagrams.

When [dsh-codex-connect](https://github.com/franksong2702/dsh-codex-connect) and its image tools are enabled in the host, new Topics can use `codex_connect_image_generate` and `view_image`. Citer does not require the connector or manage its account setup. Real generation and viewing have been exercised with connector `0.1.0-alpha.4.34`.

Before saving cards, the model is instructed to check definitions, conditions, derivations, numbers and contradictions, then correct or mark unverified claims. Self-review does not ensure factual accuracy; acceptance found and corrected a model error. See the [validation record](../../docs/validation/2026-09-12-native-real-model.md). Active recall is optional and off by default. There is no spaced repetition, reminder or streak system.

## Topics and layout

The list icon opens searchable Topics for the current source; ＋ creates a blank Topic. Double-click the title or press F2 to rename; Enter/blur saves and Escape cancels. Archive hides a Topic while preserving its records, and the archive list restores it. Permanent deletion requires the full Session ID and removes only Citer-owned Topic files after releasing its runtime. Symlinks and paths outside the owned directory are rejected. Source Sessions are never deleted.

Wide windows keep source and Citer side by side, with a resizable divider. Drag the title area away to float; release at the right window edge to dock. When space is insufficient, Citer occupies the main content area with a Back button at the top left. Back restores the source. It never moves below the source on narrow screens. Closing restores host space; native details and Desktop captions remain available.

Surfaces use translucent backgrounds, blur and short transitions, respecting host themes and reduced-motion settings. A dedicated adapter owns layout changes; unknown host structures do not receive an intrusive full-screen fallback.

## Storage and migration

Topics appear only in Citer navigation. DSH does not recursively discover nested Topic logs. Citer owns live membership and navigation; native send services can address a loaded Topic by identity.

```text
.dsh/sessions/<workspace>/<sourceSession>/
├── session.v3.jsonl[.zstd]       DSH-owned source
└── citeciter/
    ├── owner.json              Verified source ownership
    ├── <topicNumber>/
    │   ├── topic.json          Title, archive state, model and source
    │   └── sessions/<workspace>/<citerSession>/session.v3.jsonl
    └── migration-backups/      Verified original copies
```

Citer owns creation, archive, restore and deletion. Archiving preserves the full log. Deletion leaves other Topics, the source and migration backups intact. Migration reads and writes through public DSH persistence APIs, compares the header and every event before switching the index, and retains originals. Moving verified old copies out of the main list requires an explicitly confirmed scope.

## Documents and native preview

While Citer is open, use the top-right … → Document reading action. The standalone reader launcher remains available when Citer is closed and no longer covers its composer.

Click 📖 to import `.txt`, `.md` or `.markdown`. The reader preserves the full document, displays at most 500 KiB of UTF-8 text per page and accepts up to 2,000,000 characters. Paging clears the previous selection but keeps the question. Preparing a draft collapses the reader. The document address and excerpt are separate removable attachments.

When the optional documentPreviews service is present, select “CiteCiter 学习” in native file preview. The host reads the file; Citer provides selectable source text, pagination and references. Creating a Topic stores a complete snapshot, unaffected by later file changes. Each snapshot is limited to 8 MiB / 2,000,000 characters and requires a source Session address.

The preview's public type baseline is resolved subpackage `0.1.5-rc.2`; the top-level DSH version does not establish service availability. Without it, conversation actions and the independent reader remain usable. The learning viewer does not provide PDF text extraction, Word parsing or OCR.

## Wheel settings

Configure the trigger, default model and eight slots in Settings → CiteCiter. Defaults are Ask, Explain, Find errors, Translate, Quantitative board, Summary cards and two empty slots. Each slot has a prompt, optional question step, content mode and default placement. Save slot edits explicitly.

A short right-click leaves a clickable wheel; Shift + right-click preserves the native menu. Arrow keys, digits 1–8 and Enter select actions. Center, empty slots, outside release, Escape, source changes or wheel blur cancel. The question dialog survives app blur and closes only on explicit dismissal or source change.

## Development and acceptance

[Contributing](../../CONTRIBUTING.md) · [0.8 release notes](../../docs/releases/v0.8.0-alpha.1.md) · [Real-model acceptance](../../docs/validation/2026-09-12-native-real-model.md)

Host and Client compile separately. Native session adaptation, source reading, index storage, attachments, queue, board capture, learning plans and UI controls are separate modules. The DSH Agent Loop is unchanged. The full host input component has no supported cross-session embedding interface; Citer reuses public ConversationController / SessionFace behavior and does not automatically inherit every third-party composer extension.

Artificial model providers, test directories and temporary acceptance scripts have been removed from the current branch, with Git history preserved. CI checks dependencies, types, build and packaging. Functional acceptance uses real models, real source branches and actual UI; the validation record states coverage and unfinished work.

MIT License.
