# `@kirkchinese/dsh-citeciter`

**A learning companion grounded in an exact point of your DeepSeek Harness conversation.** Select text from a completed assistant reply, choose `Citer!`, ask your own question, and continue learning in a durable Citation Thread without writing to the source session.

[中文说明](https://github.com/kirkchinese/CiteCiter/blob/main/packages/citeciter/README.zh.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

> **Early development:** v0.2.0 introduced the durable Host+Client architecture; v0.2.1 fixes later-turn preparation when DSH treats an already-effective read-only switch as an idempotent no-op. APIs, compatibility, and installation details may still change. Issues and pull requests are welcome.

## Install

CiteCiter requires Node.js `^22.19.0 || >=24.0.0`, DSH Web, and a configured model provider.

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.2.1
```

Restart the corresponding DSH Web process and refresh the page. A restart is required after installation or upgrade because the Host and Typert manifests are loaded at process startup.

The package declares DSH peers from `^0.1.0-rc.6`. Focused builds use the rc.6 package set; the v0.2 browser flow was also verified on a fresh DSH `0.1.0-rc.7` process.

## Use

1. Select text wholly inside one completed assistant response.
2. Right-click and choose `Citer!`.
3. Write a custom first question or use a quick question.
4. Continue with genuine follow-up turns in the same Thread.
5. Reopen, switch, rename, or archive Threads from the persistent launcher.

Each Citation creates or reuses an isolated child session at the exact historical boundary. The main DSH session never changes and its log is not modified.

## What v0.2 implements

- **Exact historical fork.** The browser resolves `data-chat-anchor-key` through the source-session snapshot, requires a finalized assistant node in a closed turn, and forks at its real `anchorSeq`. Key text is never interpreted as an event sequence.
- **Stable Citation identity.** Source session, anchor seq, exact UTF-16 range, selected text, and bounded surrounding evidence are canonicalized and hashed with SHA-256. Different ranges in one answer remain different Citations.
- **Four separate model-input layers.** A scoped system Tutor, the inherited history prefix, durable user-role Citation Context, and genuine user questions retain distinct authority and persistence.
- **Persistent multi-turn Threads.** The first question and follow-ups are normal child-session user messages. The panel shows only child-owned transcript rows, not inherited history or runtime-context plumbing.
- **Recovery and organization.** Host projection data powers a persistent launcher, parent-grouped picker, page-reload/process-restart recovery, rename, switch, and supported workspace archive.
- **Fail-closed isolation.** CiteCiter opens the concrete child without navigating the main GUI, requires matched admission plus durable successful `/permission read-only` settlement and a current read-only sandbox, validates Host lineage and Citation evidence, and guards model tool execution with an explicit allowlist.
- **Parent noninterference.** Citation context, questions, answers, stop operations, errors, and titles belong to the child. Browser smoke checks that the source log's size and nanosecond mtime do not change.
- **Safe rich answers.** Markdown, code, and KaTeX stream normally. Complete safe `svg` fences become inert data-URI images. Complete `html` fences use a script-free, network-free sandboxed iframe. Rejected or incomplete fences remain Markdown code blocks.
- **Fiber-owned cleanup.** Host Agent effects, Client Remote mounts, slots, listeners, subscriptions, animation frames, and in-flight state are reversible. Late async work cannot reinstall state after disposal.

## Input model

```text
system: Scoped CiteCiter Tutor
history: exact source-session prefix through the selected assistant boundary
user context: durable, quoted Citation JSON (untrusted data)
user: the person's actual first question and follow-ups
```

Citation text never receives system authority, even when it contains instruction-like prose, role-shaped JSON, HTML, or delimiters. The accepted architecture decision and real-model comparison are documented in [`docs/architecture/0001-model-input-layering.md`](https://github.com/kirkchinese/CiteCiter/blob/main/docs/architecture/0001-model-input-layering.md).

## Compatibility and limitations

- DSH Web and completed `assistant-step` replies only; user messages, input fields, and arbitrary page text are ignored.
- The selection must stay inside one assistant flow. Cross-message and cross-block Citations are not supported.
- Archive hides a Thread through the DSH workspace archive set. CiteCiter has no unarchive UI; selecting the same Citation after archive may create a new active Thread.
- The current read-only tool allowlist is intentionally conservative. `run_code` remains available for sandboxed analysis, but Host preparation durably verifies the read-only sandbox and every nested tool dispatch still passes the authoritative allowlist guard. A tool absent from the running DSH installation is unavailable.
- Rich HTML/SVG rendering is intentionally conservative; rejected content falls back to visible source rather than executing.
- No settings UI, localization framework, mobile-specific layout, or cross-platform browser CI yet.
- DSH is still prerelease software; later DSH APIs may require a CiteCiter update.

## Development

From the repository root:

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

The repository tracks `packages/citeciter/lib/`. The build removes stale top-level chunks before emitting the Host entry, Client bundle, strict Typert artifacts, and declarations. Reproducible model evaluation, disposable browser smoke, HMR checks, and publish gates are in the [verification guide](https://github.com/kirkchinese/CiteCiter/blob/main/docs/implementation-milestones.md).

## Contributing and license

CiteCiter is published early so the community can help shape it. Please open an [issue](https://github.com/kirkchinese/CiteCiter/issues) or submit a pull request. Contributor rules are in [AGENTS.md](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md).

MIT © CiteCiter contributors
