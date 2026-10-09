# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

CiteCiter is an external [DSH](https://github.com/deepseek-ai/deepseek-harness) plugin. It follows the DSH [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [plugin conventions](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md); check them against the DSH version you build for. The product rules are in [docs/product.zh.md](docs/product.zh.md).

## Setup and checks

Use Node.js `^22.19.0 || >=24.0.0` and pnpm `11.21.0`.

```sh
pnpm install --frozen-lockfile
pnpm check:git-entry     # root Git-install manifest matches the package manifest
pnpm check:readme        # package READMEs match the repository READMEs
pnpm peers check
pnpm typecheck           # Host and Client against the main SDK
pnpm typecheck:desktop   # the same sources against the official Desktop SDK
pnpm test                # unit tests (compiles first)
pnpm build               # rebuilds the committed lib/
```

CI runs the same commands on Ubuntu and Windows. `pnpm --dir packages/citeciter dev` rebuilds on change; it does not start DSH.

## Repository layout

| Path | Contents |
| --- | --- |
| `packages/citeciter/` | The plugin: `src/` (Host files at the top level, browser code in `client/`), `tests/`, `scripts/`, and the committed build output `lib/` |
| `packages/citeciter-compat-desktop/` | A private, compile-only manifest pinning the official Desktop SDK for `typecheck:desktop` |
| `package.json` (root) | The Git-install entry; generated from the package manifest |
| `docs/product.zh.md` | Product rules |

## Two SDK baselines

The package's `devDependencies` pin the main SDK (currently DSH `0.2.1-alpha.2`); `peerDependencies` list every DSH version the plugin supports. `citeciter-compat-desktop` pins the official Desktop SDK (`0.2.0-rc.2`), and `scripts/check-desktop.mjs` compiles the same Host and Client sources against it. Host and Client are separate TypeScript programs (`tsconfig.host.json`, `tsconfig.client.json`) because both faces declare services with the same names.

To support a new DSH release: update the DSH versions in `devDependencies` (or in the compat package for a Desktop release), add the version to every DSH peer range, run `pnpm sync:git-entry` and `pnpm install`, then run all checks. Remove a peer only when nothing in `src/` imports it.

## Committed build output and Git installs

`lib/*.js` and `lib/types/**/*.d.ts` are released files and are committed, because Git installs use them without building. Rebuild before committing a source change. The intermediate `lib/types/**/*.js` that `tsc` emits for the bundler is ignored.

pnpm's Git fetcher reads the repository root and ignores `publishConfig.directory`, so the root `package.json` mirrors the package manifest with paths into `packages/citeciter/`. Edit only `packages/citeciter/package.json` and run `pnpm sync:git-entry`. Root scripts use `pnpm --dir packages/citeciter`; both manifests share one name, so do not select the package with `--filter`.

Edit only the repository READMEs. `pnpm sync:readme` generates `packages/citeciter/README.md` (English, shown on npm) and `README.zh.md`, rewriting relative links to the release tag.

## Architecture

Behavior lives in plugin contributions and documented DSH services; the host Agent Loop is never patched. Each Topic is a native DSH Session stored under its source session's `citeciter/` directory and never appears in the host's session list.

| Area | Modules |
| --- | --- |
| Host entry and Remote API | `index.ts`, `service.ts`, `typert.*.ts`, `host-settings-adapter.ts` |
| Topic use cases | `topic-runtime.ts` (creation, admission queue, questions, deletion, model routing) |
| Native sessions | `host-session-adapter.ts`, `citer-session-world.ts`, `citer-session-store.ts`, `citer-agent-registry.ts`, `host-agent-modules.ts` |
| Storage | `source-storage.ts`, `topic-index.ts`, `topic-deletion-receipts.ts`, `owned-session-cleanup.ts`, `legacy-migration.ts`, `session-migration.ts`, `session-format-guard.ts` |
| Log projections | `topic-log.ts`, `tool-events.ts`, `tool-approval-projection.ts`, `message-projection.ts`, `topic-stream.ts` |
| Evidence and sources | `observer.ts`, `citation-mapping.ts`, `evidence-text.ts`, `source-session.ts`, `source-read-tool.ts`, `documents.ts`, `document-tools.ts`, `document-access.ts` |
| Drafts and questions | `draft-*.ts`, `question-draft-*.ts`, `topic-questions.ts`, `topic-question-bridge.ts`, `blocking-question-recovery.ts`, `question-reply.ts` |
| Board and learning | `board.ts`, `blackboard-tool.ts`, `board-capture*.ts`, `learning*.ts` |
| Client | `client/index.ts` assembles controllers; `client/components/` holds React views that receive snapshots and callbacks and never look up Cordis services |

Three host adaptations are deliberate and isolated; do not spread them:

- `citer-session-access.ts` wraps the host's `sessions.flush` for the plugin's lifetime so Citer-owned sessions are flushed to their own store, and checkpoints them before each model request through the public `llm/stream` event. The original `flush` is restored on teardown, and host `get`/`list` stay unchanged so Topics never reach the session list.
- `host-agent-modules.ts` loads the host's AgentLoop, SessionStore, title service and scope factory through the profile resolver, so Desktop and symlinked CLIs share one module instance.
- `client/host-dock.ts` and its CSS reserve layout space for the panel and restore the host's styles on close.

Other rules: registrations are effects (`ctx.effect()`, `ctx.on()`) released with their owner; waterfall listeners call `next()` unless they deliberately claim the request; validate data at file, wire and configuration boundaries and trust typed same-process calls; model-visible input must be reconstructable from the Topic log; read persisted settings field by field so keys from other versions are ignored.

## Testing

Unit tests in `packages/citeciter/tests/` use `node:test` against the compiled `lib/types/` output; `pnpm test` compiles first. Test pure logic (citation mapping, log projections, draft merging, settings and metadata parsing) and keep tests free of fake model providers.

Static checks and unit tests do not establish that a feature works. Verify user-visible changes in a real DSH with a real model: install the packed or Git build into a profile, exercise the flow in the actual UI, and check the Topic files it writes. Never run two host processes on the same DSH home.

## Releasing

1. Update `version` in `packages/citeciter/package.json`, then run `pnpm sync:git-entry` and `pnpm sync:readme`.
2. Move the `Unreleased` notes in `CHANGELOG.md` under the version and date.
3. Run all checks, `pnpm build`, and `pnpm --dir packages/citeciter pack`.
4. Verify the packed build in a real DSH.
5. Publish with an explicit registry and tag: `npm publish <tarball> --registry=https://registry.npmjs.org --tag <tag>`.
6. Merge to `main`, tag `v<version>`, and create the GitHub Release with the same tarball.

Do not commit credentials, `.env`, `.npmrc`, sessions, screenshots or tarballs.

MIT License.
