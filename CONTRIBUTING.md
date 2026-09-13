# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

Use Node.js `^22.19.0 || >=24.0.0`, pnpm `11.21.0`, DSH `0.1.5-rc.1` and Desktop `2.0.9`. The package lives in `packages/citeciter/`; Host and Client compile separately with strict TypeScript.

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm --dir packages/citeciter pack --pack-destination E:/project/CiteCiter/.refs/artifacts
git diff --check
```

Tracked `lib/` is a release artifact and must be rebuilt after source changes. `pnpm --dir packages/citeciter dev` watches builds only; it neither starts models nor creates test instances. CI checks dependencies, types, build and packaging. Static success is not functional acceptance.

## Architecture boundaries

Follow the [DSH architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [plugin conventions](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md), checking actual installed subpackage versions and contracts. CiteCiter is an external plugin; do not claim DSH monorepo-only gates ran here.

| Module | Responsibility |
| --- | --- |
| host-session-adapter.ts | Native Agent creation, resumption, initial permissions and scoped contributions |
| citer-session-world.ts / citer-session-store.ts | Owned native factories and membership; no root navigation announcement |
| citer-session-access.ts | Reversible native get/flush routing by exact identity; list remains unchanged |
| source-storage.ts / session-migration.ts / owned-session-cleanup.ts | Verified source paths, complete-log migration and contained cleanup |
| source-session.ts | Source observation, disposal and submitted-reference checks |
| topic-index.ts | Metadata validation, navigation and legacy private-log cleanup |
| topic-runtime.ts | Topic use cases, tool contributions and legacy compatibility |
| board-capture.ts | Capture correlation, cancellation, timeout and native attachment storage |
| client/native-composer.ts | Published DSH attachment, send and queue services |
| native-attachment-read.ts / client/file-download.ts | Exact Topic authorization, native file/image reads and download lifetime |
| client/draft-references.ts | Draft references and exact submission serialization |
| client/learning-route.ts | Learning request constraints and native todo result reading |
| client/panel-drag.ts, host-dock.ts | Pointer and host layout lifecycles |
| client/components/ | Controlled UI receiving snapshots and callbacks, without Cordis discovery |

Do not patch the Host Agent Loop, append Topic work to source Sessions or leak removed draft references through hidden seeds. New Topics default to read-only and retain DSH permission/approval enforcement after explicit changes. Migration must compare the complete original log, retain original copies and never expand permissions.

Use scoped injection, ctx.effect and ctx.on. Release event listeners, observers, capture requests, object URLs and factory handles. Validate external JSON at readers; typed same-process calls need no duplicate decoding. Public APIs document inputs, outputs and lifecycle obligations.

## Local installation and real acceptance

This acceptance uses the main DSH home as requested. Before starting or restarting a host, confirm no other Web or Desktop writer uses that home. Preserve user Sessions. Identify development processes and directories individually before cleanup.

Web uses the global CLI: `dsh plugin --profile web add <absolute package path>`. Desktop uses `dsh plugin add <absolute package path>` in its managed terminal, which selects the bundled CLI, desktop profile and home. The global CLI cannot replace management of Desktop's reserved profile.

For the first Web visit, use the full login URL printed by the host, then its session cookie. Treat login parameters as credentials and exclude them from Git and documentation. Restart after Host updates and reload after Client updates.

Functional acceptance must use real models, real source branches and actual UI. Cover text, programming, images, Q&A, teaching, attachment combinations, permissions, model/reasoning selection, queue/steer/stop, reference removal, document pagination, archive/restore, layouts and restart recovery. Inspect actual output, file side effects, durable logs and rendered layout. Scripts alone do not establish correctness.

Do not retain artificial providers, fixtures or temporary test scripts. Remove temporary scripts after use. Keep procedures, results and limits in acceptance records, excluding Sessions, credentials, screenshots and packages. Previously committed scripts are removed from the current branch without rewriting Git history. Record factual model errors separately from engineering failures; ask the user when expected product behavior is unclear.

## Documentation and delivery

Keep root/package Chinese and English READMEs aligned. Public behavior changes update release notes, JSDoc, `.agents/notes/` and `docs/validation/`. Identify diagrams and actual results accurately. Use one physical line per paragraph and one final newline.

Publish only when explicitly requested, using the inspected package from the tested commit. Verify npm version, dist-tag and integrity after publishing; attach the same package to the matching GitHub Release. Building a package does not publish it or authorize merging a branch.

MIT License.
