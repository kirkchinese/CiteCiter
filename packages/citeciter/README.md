# `@deepseek-ai/dsh-citeciter`

CiteCiter is a browser plugin for DSH Web. Select text from an assistant reply, choose `Citer!` from the context menu, and read an explanation in the resizable `details` column.

## Behavior

- The plugin resolves selection only inside an `assistant-step` conversation node.
- It resolves the DOM anchor key through the active session snapshot, uses that node's `anchorSeq` to fork at its completed-turn boundary, opens the child without selecting it, switches that child to `/permission read-only`, and sends the explanation prompt only after the switch succeeds. The numeric prefix in a conversation key is never treated as an event sequence. A child is reused only while both parent session and resolved anchor remain the same.
- The parent session is not written by the plugin. The child session owns its prompt, model response, cancellation, and errors.
- The panel renders streaming Markdown, KaTeX, and code. Complete safe `svg` fences render as inert data-URI images. Complete `html` fences render in a script-free, network-free sandboxed iframe. Rejected or incomplete fences remain ordinary Markdown code blocks.

## Model experience

The model receives the explanation prompt only in the forked child session. Its response and any tool request belong to that child log; the parent session's transcript and model context stay unchanged.

## Build and test

```sh
pnpm install
pnpm --filter @deepseek-ai/dsh-citeciter typecheck
pnpm --filter @deepseek-ai/dsh-citeciter test
pnpm --filter @deepseek-ai/dsh-citeciter build
```

## Browser smoke

Use `dev/seed-smoke-session.mjs` before starting the disposable Web profile, then run `dev/smoke.mjs` as shown in `README.zh.md`. The seed contains one settled turn with the real `14:assistant-step1:1` key; the browser smoke selects that rendered conversation node instead of injecting a DOM fixture.

## Live browser development

1. Link this package into a disposable DSH Web profile and add `dev/patch.yml` as shown in `README.zh.md`.
2. Start that DSH Web profile and open its URL once. The Web profile mounts the Cordis client-HMR host and browser plugins.
3. From this workspace, run `pnpm --filter @deepseek-ai/dsh-citeciter dev`; it first builds and then watches the emitted declaration modules and browser bundle.

The DSH host detects the changed bundle, emits a `/plugins/events` rebuild frame, and the browser replaces the CiteCiter Cordis fiber. Plugin-local React and panel state reset; DSH-owned session data remains. A full DSH source checkout needs its own `pnpm run dev:web` only when editing DSH-owned client-package sources; the installed runtime package has no development scripts. Web-shell changes still require rebuilding the Web artifacts and refreshing the existing URL.

With a mounted development server running, `node packages/citeciter/dev/hmr-smoke.mjs http://127.0.0.1:3907` atomically changes and restores the built bundle, then verifies the rebuild frame, old-fiber teardown, new-fiber interaction, and browser errors.
