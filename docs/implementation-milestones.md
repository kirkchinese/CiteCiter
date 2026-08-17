# CiteCiter verification

This repository records reproducible verification for the current CiteCiter package. Package behavior and operating instructions belong in `packages/citeciter/README.md` and `README.zh.md`.

## Focused checks

```sh
pnpm --filter @kirkchinese/dsh-citeciter typecheck
pnpm --filter @kirkchinese/dsh-citeciter test
pnpm --filter @kirkchinese/dsh-citeciter build
```

The unit suite covers real conversation-key lookup through the parent snapshot, missing and running source-node rejection, prompt construction, streaming assistant-text extraction, read-only fail-closed behavior including an unmatched permission command, repeated explanations, anchor and parent-session changes, teardown during an in-flight fork or cancellation, subscriber error isolation, rich-fence splitting, unsafe SVG fallback, HTML CSP construction, and incomplete-fence fallback.

## Browser smoke

Use a disposable DSH home and profile link:

```sh
pnpm --filter @kirkchinese/dsh-citeciter exec playwright install chromium
mkdir -p /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese
ln -sfn "$(pwd)/packages/citeciter" /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese/dsh-citeciter
node packages/citeciter/dev/seed-smoke-session.mjs /tmp/citeciter-dsh-home "$(pwd)"
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
node packages/citeciter/dev/smoke.mjs http://127.0.0.1:3907 'CiteCiter' \
  /tmp/citeciter-dsh-home/citeciter-smoke.json
```

The seed creates a settled conversation node whose actual DOM key is `14:assistant-step1:1` and whose snapshot `anchorSeq` is 6. The smoke exits non-zero unless selecting that rendered assistant text suppresses the native context menu, the `Citer!` entry opens the details column, closing restores the layout, reopening creates one panel, the parent log's size and nanosecond modification time remain unchanged, and the page records no console errors. A temporary environment without a provider credential validates the rendered error state but cannot validate model-authored SVG or HTML output.

## Live development

`pnpm --filter @kirkchinese/dsh-citeciter dev` watches this package's declaration output and browser bundle. A running DSH Web profile already mounts the Cordis client-HMR host and browser halves: the Host re-hashes the changed bundle and sends an SSE rebuild frame, then the browser tears down and replaces the plugin fiber. `pnpm run dev:web` is additionally required only when the changed sources belong to DSH's own client packages in a full DSH source checkout.

After mounting CiteCiter and opening the development URL, run `node packages/citeciter/dev/hmr-smoke.mjs http://127.0.0.1:3907`. The smoke atomically changes and restores the built bundle and exits non-zero unless it observes the CiteCiter rebuild frame, old-fiber unmount, a working new context menu, and no browser errors.
