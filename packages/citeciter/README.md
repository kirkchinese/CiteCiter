# `@kirkchinese/dsh-citeciter`

CiteCiter is a browser plugin for DeepSeek Harness (DSH) Web. Select text in a completed assistant reply, choose `Citer!` from the context menu, and read a context-aware explanation in the resizable DSH details column.

[中文说明](https://github.com/kirkchinese/CiteCiter/blob/main/packages/citeciter/README.zh.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

> **Early development:** v0.1.0 implements the first usable path, but many features still need work. APIs, compatibility, and installation details may change. Issues and pull requests are welcome.

## Install

CiteCiter requires Node.js `^22.19.0 || >=24.0.0`, DSH Web, and a configured model provider. It is developed and tested against the DSH `0.1.0-rc.6` client packages.

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter
```

Restart the corresponding DSH Web process and refresh the page. Select text inside a completed assistant reply and right-click to open `Citer!`.

## Behavior

- The plugin accepts selections only inside an `assistant-step` conversation node.
- It resolves the DOM anchor key through the active parent-session snapshot and forks at that node's real `anchorSeq`. It never treats the numeric prefix of a conversation key as an event sequence.
- The child opens without becoming the current session. CiteCiter runs `/permission read-only` and sends the explanation prompt only when DSH reports both command success and a matched command.
- A child is reused only while both the parent session and resolved anchor remain unchanged. Repeated requests baseline existing assistant nodes so an earlier answer cannot be shown as the new result.
- The parent session is never written by CiteCiter. The child log owns the prompt, model response, cancellation, and errors.
- The panel streams Markdown, KaTeX, and code. Complete safe `svg` fences become inert data-URI images. Complete `html` fences render in a script-free, network-free sandboxed iframe. Rejected or incomplete fences remain Markdown code blocks.

Forked explanation sessions are durable DSH sessions. Closing the panel or unloading the plugin detaches CiteCiter's subscription but does not delete or cancel an already-created child.

## Compatibility

The peer range is `^0.1.0-rc.6` for the required DSH client packages and `^4.0.1` for Cordis. The `0.1.0-rc.6` packages were verified as published on the public npm registry and are the current test baseline. Other DSH prerelease versions have not received the same validation.

## Development

From the repository root:

```sh
pnpm install
pnpm --filter @kirkchinese/dsh-citeciter typecheck
pnpm --filter @kirkchinese/dsh-citeciter test
pnpm --filter @kirkchinese/dsh-citeciter build
```

The test script rebuilds declaration modules before running the Node test suite. Browser fixture, smoke, and client-HMR instructions are maintained in the repository's [verification guide](https://github.com/kirkchinese/CiteCiter/blob/main/docs/implementation-milestones.md).

## Contributing and license

CiteCiter is intentionally being published early so the community can help shape it. Please open an [issue](https://github.com/kirkchinese/CiteCiter/issues) or submit a pull request. Contributor rules are in the repository [AGENTS.md](https://github.com/kirkchinese/CiteCiter/blob/main/AGENTS.md).

MIT © CiteCiter contributors
