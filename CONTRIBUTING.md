# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

Use Node.js `^22.19.0 || >=24.0.0` and pnpm `11.21.0`. The `0.9.0-alpha.4` candidate compiles against DSH `0.2.1-alpha.1`; `typecheck:desktop` checks the same Host/Client sources against the official Desktop SDK `0.2.0-rc.2`. Only the official DSH desktop application is a supported adaptation target; community desktop compatibility is no longer guaranteed. Real-model acceptance remains separate from these compile checks and is tracked in `docs/validation/2026-10-07-official-desktop.md`. The package lives in `packages/citeciter/`.

```powershell
pnpm install --frozen-lockfile
pnpm check:git-entry
pnpm peers check
pnpm typecheck
pnpm typecheck:desktop
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
git diff --check
```

Tracked `lib/` is a release artifact and must be rebuilt after source changes. `pnpm --dir packages/citeciter dev` watches builds only; it neither starts models nor creates test instances. CI checks dependencies, types, build and packaging. Static success is not functional acceptance.

## Repository Git entry

`packages/citeciter/package.json` remains the canonical npm manifest. The root manifest is a private Git-install entry with the same package identity, version, runtime metadata and development pins; its exports and bundle patch point directly to the committed files under `packages/citeciter/`. pnpm's Git fetcher does not apply `publishConfig.directory`, so that setting alone cannot expose a monorepo plugin. Root `publishConfig.directory` still keeps `pnpm pack` pointed at the canonical npm artifact.

After changing canonical metadata, run `pnpm sync:git-entry`, then `pnpm install` to refresh the lockfile. `pnpm check:git-entry` rejects drift and is a build/CI gate. Root scripts use `pnpm --dir packages/citeciter`; avoid selecting the package by name with `--filter`, because the root and inner package intentionally share that name. Keep host modules, including `dsh-util-values`, in the declared peer range and pin each compile gate to its own SDK; do not hide cross-version warnings with peer exemptions.

Git installs use committed build output and do not need a root `prepare` hook, a nested `file:` dependency or a dependency on a previously published CiteCiter package. Current runtime commit `cfcdac8befc9e140d95d79f1fb45effe47372cf1` is public on `codex/official-desktop-october`, without a merge into `main` or a new Release/npm publication. For candidate retesting only, use `dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#cfcdac8befc9e140d95d79f1fb45effe47372cf1"`; this remains a candidate awaiting independent review and the recorded local cleanup. The [alpha.3 regression comparison](docs/validation/2026-10-09-alpha3-regression.md) records the current review scope and remaining gaps.

Earlier October 7 checks cover a real local Git snapshot with pnpm `11.7.0` and a public installation of the earlier `f8825a6` commit through official CLI `0.2.0-rc.2` with pnpm `11.21.0`. The official Desktop plugin page then installed and activated the earlier pinned `f0c30dd99299e4c054f1951a014489364ee7713e` commit, followed by a complete app exit and restart. All 156 published files, including 149 lib files, matched that commit byte for byte; entry bytes matched the preceding `636409058e77` tarball. The source, five Topics, five ordinary drafts and attachments remained intact. This is historical pinned-Git installation evidence; its 156 files must not be conflated with the tarball's 154 files. Later fixes use separately installed candidates. The official acceptance record identifies the current package and each observed result; the final Windows functional results and external limits are recorded in the alpha.3 regression comparison; independent review is still pending.

## Architecture boundaries

Follow the [DSH architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [plugin conventions](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md), checking actual installed subpackage versions and contracts. CiteCiter is an external plugin; do not claim DSH monorepo-only gates ran here.

| Module | Responsibility |
| --- | --- |
| host-settings-adapter.ts / typert-codec.ts / client/host-ui-adapter.ts / client/host-icons.ts | Normalize the two pinned host contracts at isolated boundaries |
| client/host-source-chat.ts | Read the public Client Session/Conversation projection without retaining or writing source history |
| session-format-guard.ts | Refuse old-host writes to newer native logs without rewriting their format |
| draft-contract.ts / draft-store.ts / client/draft-controller.ts | Versioned draft state, owned byte storage, CAS saves and exact admission reconciliation |
| question-draft-contract.ts / question-draft-store.ts / question-draft-lifecycle.ts / client/question-draft-controller.ts | Separate question-card state, revision-checked persistence and exact Host outcome reconciliation |
| topic-question-bridge.ts / blocking-question-recovery.ts | Scoped public tool-call identity and same-Topic blocking-card recovery after Host exit; no automatic model submission |
| topic-deletion-receipts.ts | Minimal durable deletion identities outside numeric Topic directories, without message or attachment content |
| model-admission.ts | Recover a retired inherited model without losing the Topic or submitting its draft |
| client/components/ToolMessage.tsx | Tool disclosure and visible attachments, using a session-authorized loader |
| client/transcript-position.ts | Per-Topic reading anchors, explicit-send following and image/reflow restoration |
| host-session-adapter.ts | Native Agent creation, resumption, initial permissions and scoped contributions |
| citer-session-world.ts / citer-session-store.ts | Owned native factories and membership; no root navigation announcement |
| citer-session-access.ts | Owned model checkpoints and reversible flush routing; Host get/list remain unchanged |
| source-storage.ts / session-migration.ts / owned-session-cleanup.ts | Verified source paths, complete-log migration and contained cleanup |
| source-session.ts | Source observation, disposal and submitted-reference checks |
| topic-index.ts | Metadata validation, navigation and legacy private-log cleanup |
| topic-runtime.ts | Topic use cases, tool contributions and legacy compatibility |
| source-read-tool.ts / topic-prompts.ts | Source tool schema, paging guidance and native prompt composition |
| document-tools.ts | Authorized document read/search contracts, UTF-16 ranges, response budgets and continuation guidance |
| topic-archive.ts | Distinguish accepted user input from later inbox claims and model/tool events for archive recovery |
| board-capture.ts | Capture correlation, cancellation, timeout and native attachment storage |
| board-capture-protocol.ts / client/board-capture-controller.ts | Poll exact Topic/revision render requests independently of panel and navigation lifecycles |
| client/components/BoardCaptureWorker.tsx / BoardCaptureSurface.tsx | Render the actual board without starting a model request |
| client/native-composer.ts | Published DSH attachment, send and queue services |
| native-attachment-read.ts / client/file-download.ts | Exact Topic authorization, native file/image reads and download lifetime |
| client/draft-references.ts | Draft references and exact submission serialization |
| client/action-executor.ts / client/selection-references.ts | Explicit append/create routing and references from actual selections |
| tool-events.ts / document-access.ts | Native/PTC event normalization and submitted-document access |
| tool-outcome-contract.ts | Dependency-free shared question outcome codes; does not import Host event declarations into Client schemas |
| tool-approval-projection.ts | Derives a rejected presentation only from one unambiguous call → approval request → rejected decision → failed result chain; leaves permissions, logs and original results unchanged |
| client/learning-route.ts | Learning request constraints and native todo result reading |
| client/panel-drag.ts, host-dock.ts | Pointer and host layout lifecycles |
| client/components/ | Controlled UI receiving snapshots and callbacks, without Cordis discovery |

Do not patch the Host Agent Loop, append Topic work to source Sessions or leak removed draft references through hidden seeds. New Topics default to read-only and retain DSH permission/approval enforcement after explicit changes. Migration must compare the complete original log, retain original copies and never expand permissions.

Use scoped injection, ctx.effect and ctx.on. Release event listeners, observers, capture requests, object URLs and factory handles. Validate external JSON at readers; typed same-process calls need no duplicate decoding. Public APIs document inputs, outputs and lifecycle obligations.

Question-card persistence covers timed and ordinary blocking questions, including untouched empty cards. Store selections, verbatim custom text, page, `edited` and `held` in the owning Topic's `question-drafts/`, independently from its ordinary message draft. Serialize CAS saves, submissions and cleanup with Topic admission/deletion. Closed records contain no answer text and reject delayed saves. Reconcile exact post-seed Host answers and outcomes against committed logs: pending timeouts, queued replies, `TOOL_OUTCOME_UNKNOWN`, a missing projection, disconnect and Client disposal do not establish completion. Ordinary blocking cards interrupted by Host exit return in the same Topic with their drafts for manual continuation; restoration never enqueues an answer or starts the model. Explicit question cancellation or a user stop closes the card and prevents restoration. Input updates synchronously. Background saves and three-way draft merging have no progress or version-selection UI; independent edits merge, and overlapping edits prefer the operating window. Input-method composition defers remote reconciliation. Exact pending-submission identities remain separate from ordinary content merging. Installed-package evidence, including PTC answer summaries, restart recovery, navigation and cleanup, is recorded by artifact in the October 7–9 validation records; source and dual-SDK static checks do not establish full functional acceptance.

The image-preview adapter retains the official lightbox's focus and Escape behavior; the attachment component continues to own its object URL. Its separate CSS targets only the branded Citer dialog's close button and uses the official `--dsh-frame-overlay-top` token to avoid the native Desktop caption. It does not patch the Host component or style unrelated dialogs. This fix passed both SDK typechecks, CSS compilation and actual close-button clicking in the official window on `a95d`; the main window stayed open. Opening and closing in a browser connected to the same Host also passed, without establishing other layouts or independent Web alpha acceptance.

Deletion commits a minimal `version/sourceSessionId/topicId/sessionId/cleanup` receipt under the source-owned `citeciter/deleted/<sessionId>.json` before removing its recovery marker. A surviving marker reports pending cleanup. The receipt contains neither Session headers nor content, and the separate directory does not reserve numeric Topic IDs. Modern source-owned records must not fall back to legacy storage when their root is unavailable. Validate exact identities and reject linked or malformed artifacts; absence or transport errors are not deletion evidence. Old deletions without a remaining marker or receipt cannot be reconstructed. The runtime and Client use this authority to retire the exact Topic's subscriptions and pending carriers, including after reconnecting. The October 9 record verifies attachment deletion, cross-window retirement during an outstanding response, and no revival after a cold restart; retain these boundaries in subsequent installed-package checks.

## Local installation and real acceptance

This acceptance uses the main DSH home as requested. Before starting or restarting a host, confirm no other Web or Desktop writer uses that home. Preserve user Sessions. Identify development processes and directories individually before cleanup.

Use the official host's documented plugin installation flow and inspect the resolved repository package, entry files and dependencies. Git installation and packaged installation require separate acceptance; use the same final candidate bytes when comparing them. The global CLI does not update the official desktop application's embedded runtime. Current installation details and limits belong in the official-desktop audit and acceptance records.

For the first Web visit, use the full login URL printed by the host, then its session cookie. Treat login parameters as credentials and exclude them from Git and documentation. Restart after Host updates and reload after Client updates.

Functional acceptance must use real models, real source branches and actual UI. Cover text, programming, images, Q&A, teaching, attachment combinations, permissions, model/reasoning selection, queue/steer/stop, reference removal, document pagination, archive/restore, layouts and restart recovery. Inspect actual output, file side effects, durable logs and rendered layout. Scripts alone do not establish correctness.

Do not retain artificial providers, fixtures or temporary test scripts. Remove temporary scripts after use. Keep procedures, results and limits in acceptance records, excluding Sessions, credentials, screenshots and packages. Previously committed scripts are removed from the current branch without rewriting Git history. Record factual model errors separately from engineering failures; ask the user when expected product behavior is unclear.

## Documentation and delivery

Keep root/package Chinese and English READMEs aligned. Public behavior changes update release notes, JSDoc, `.agents/notes/` and `docs/validation/`. Identify diagrams and actual results accurately. Use one physical line per paragraph and one final newline.

Publish only when explicitly requested, using the inspected package from the tested commit. Verify npm version, dist-tag and integrity after publishing; attach the same package to the matching GitHub Release. Building a package does not publish it or authorize merging a branch.

MIT License.
