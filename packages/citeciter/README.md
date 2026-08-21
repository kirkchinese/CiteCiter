# `@kirkchinese/dsh-citeciter`

**A private learning companion for live DeepSeek Harness conversations.** Select text from a committed assistant model call, ask beside the selection, and continue the discussion in an independent CiteCiter Topic while the source Agent keeps working.

[中文说明](README.zh.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

> **Early development:** v0.3 replaces ordinary DSH child Threads with private Observer Topics. APIs, storage, compatibility, and installation details may still change.

## Install

CiteCiter requires Node.js `^22.19.0 || >=24.0.0`, DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8` (tested on `0.1.0-rc.7`), and a configured model provider.

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.0
```

Restart the corresponding DSH Web process and refresh the page after installation or upgrade. The Host, Typert descriptors, and browser bundle are resolved when the process starts.

## Use

1. Select text inside a committed assistant model call. The surrounding Agent turn may still be running.
2. Right-click, enter the first question in the selection popover, and choose `Citer!`.
3. CiteCiter creates a new Topic for every submission and opens it in the wide learning dock.
4. Continue with normal follow-up questions, or reopen an older Topic from CiteCiter's own Topic rail.
5. Adjust the model, reasoning effort, title, archive state, and dock width without changing the source Session.

The default mode is Observer. Exact Fork remains an advanced mode for a source turn that has already ended; `exact-when-available` uses Observer when that stable fork boundary does not exist.

## What v0.3 implements

- **Model-call citation boundary.** A committed `assistant/message` is enough to create an Observer Topic; CiteCiter does not wait for `turn/end`.
- **Exact Markdown selections.** Rendered selections map through GFM source positions to the original Markdown. Emphasis, deletion, links, and code retain Host-verifiable UTF-16 ranges while the UI keeps the text the user actually saw.
- **One submission, one Topic.** Repeating the same selection creates another private conversation instead of silently reusing an earlier one.
- **Private standard DSH Sessions.** Topic logs use the DSH Session, Agent Loop, tool, title, and persistence services under CiteCiter-owned storage in `$DSH_HOME/citeciter/`; they do not appear in the ordinary Session list.
- **Bound Observer evidence.** The Topic-only `read_source_session` tool reads structured committed events from its fixed source Session, records the captured seq, and never exposes the physical Session file to the model.
- **Independent titles and model controls.** New Topics copy the source model route, generate a DSH title after the first prompt, and can later switch model and reasoning effort independently.
- **Source-aware settings.** The DSH settings page controls the default context mode, source reasoning, optional read-only source-file access, dock width, and reopening the last Topic.
- **Read-only execution.** The private Agent uses a read-only sandbox. Only `read_source_session` and, when enabled and available, the standard file `read` tool reach the model.
- **Independent lifecycle.** Topics can be reopened, renamed, archived, restored, stopped, and continued without navigating or writing to the source Session.
- **Safe rich answers.** Markdown, code, and KaTeX render normally. Conservative SVG and sandboxed HTML handling falls back to visible source when content is incomplete or unsafe.

## Model input

```text
system: the Topic-scoped CiteCiter Tutor and read-only policy
history: this Topic's own DSH history (plus a frozen prefix only in Exact Fork)
user context: the durable Citation record, explicitly marked as untrusted evidence
tool result: bounded source Session or source-workspace evidence read on demand
user: the person's actual first question and follow-ups
```

Source text, reasoning, tool arguments, tool results, and workspace files remain untrusted evidence. They never receive system authority. See [ADR 0002](https://github.com/kirkchinese/CiteCiter/blob/main/docs/architecture/0002-observer-learning-companion.zh.md) for the product and storage decisions.

## Upgrade from v0.2

Installing v0.3 replaces the plugin code but does not rewrite the source Sessions or v0.2 forked Citation Threads. Those older child Sessions remain ordinary DSH data and are not imported into the v0.3 Topic rail. New discussions use the private v0.3 store.

Use a valid three-part version such as `0.3.0`, then verify the installed result rather than relying only on the package-manager completion line:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.3.0
dsh plugin --profile web list --depth 0
```

## Compatibility and limitations

- CiteCiter supports DSH Web and selections contained in one committed assistant flow. Cross-message and cross-block selections are not supported.
- KaTeX layout and footnote numbers are renderer-generated DOM without stable source-character coordinates, so selecting those elements does not open CiteCiter; ordinary text around a formula remains citable.
- Observer sees only committed Session events. It cannot cite an unfinished streaming fragment that has not produced `assistant/message`.
- Source reasoning is available only when it was recorded by the source provider and the CiteCiter setting remains enabled.
- Source-file access requires the running DSH composition to provide its filesystem service; it remains read-only and can be disabled.
- A missing source Session does not delete an existing Topic, but fresh source reads fail and the dock reports that the source is unavailable.
- The interface currently uses Chinese product copy and has no complete localization or cross-platform browser CI.
- DSH remains prerelease software; later DSH APIs may require a CiteCiter update.

## Development

From the repository root:

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

The repository tracks `packages/citeciter/lib/`. Rebuild after changing source or build configuration, and inspect the real npm tarball before publishing.

For browser work, use a disposable DSH home and a dynamically assigned port so an existing server on `3080` is never touched:

```sh
CITECITER_DSH_ROOT="$(mktemp -d /tmp/citeciter-dsh.XXXXXX)"
mkdir -p "$CITECITER_DSH_ROOT/profiles/node_modules/@kirkchinese"
ln -s "$(pwd)/packages/citeciter" \
  "$CITECITER_DSH_ROOT/profiles/node_modules/@kirkchinese/dsh-citeciter"
node packages/citeciter/dev/seed-smoke-session.mjs \
  "$CITECITER_DSH_ROOT" "$(pwd)"
DSH_HOME="$CITECITER_DSH_ROOT" dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 0
```

Use the printed URL for browser inspection and stop only that disposable process.

## Contributing and license

Please open an [issue](https://github.com/kirkchinese/CiteCiter/issues) or submit a pull request. Contributor rules are in [AGENTS.md](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md).

MIT © CiteCiter contributors
