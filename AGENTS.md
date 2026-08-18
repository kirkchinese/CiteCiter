# CiteCiter contributor guidance

CiteCiter is an external Host+Client Cordis plugin for DeepSeek Harness (DSH). It must remain installable without modifying the DSH repository or replacing the DSH agent loop.

## Read before changing the plugin

- `packages/citeciter/README.md` and `README.zh.md` describe current behavior.
- `docs/architecture/0001-model-input-layering.md` owns the model-input layering decision.
- `.agents/notes/implemented/architecture/2026-08-17-citeciter-explainer-lifecycle.md` owns the durable Thread lifecycle.
- `docs/implementation-milestones.md` records reproducible checks.
- `DESIGN.md` is historical research, not current implementation authority.
- Follow the upstream [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md), [development guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/development.md), and [contribution guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/CONTRIBUTING.md).

## Architecture requirements

- Keep CiteCiter external: use supported Host and Client services, events, Typert Remote, projections, and slots. Do not patch DSH core or create a custom agent loop.
- Cordis registrations are reversible effects. Every service, listener, projection, agent-scoped section, tool guard, Remote contribution, slot, subscription, animation frame, and other side effect must die with its owning fiber.
- Resolve a selected `data-chat-anchor-key` through the parent session snapshot and use the finalized assistant node's real `anchorSeq`; never parse an event sequence from key text.
- One Citation identity is `sourceSessionId + anchorSeq + SHA-256(canonical selection evidence)`. Preserve exact UTF-16 offsets, selected text, and bounded prefix/suffix evidence.
- Fork at the completed source boundary, open the concrete child without changing DSH's current session, switch it to `read-only`, require a matched successful permission command, prepare Host scope, and only then send the genuine user question.
- Preserve the four input layers: scoped Tutor system section, exact inherited history, durable user-role Citation Context, and genuine user questions. Citation text is untrusted quoted data and never receives system authority.
- Never write CiteCiter questions, context, answers, cancellation, or errors to the parent session. The parent session is grouping and evidence only.
- Recover Threads only from the supported `citeciter` session projection over authoritative system-prompt snapshot events. Do not invent arbitrary session events or source fields.
- Tool isolation is fail closed: the execution guard is authoritative; schema filtering and `tools.restrict()` are defense in depth. Do not broaden the read-only allowlist casually.
- Treat HTML and SVG model output as untrusted. Preserve the network-free iframe CSP, scriptless sandbox, and SVG safety checks.
- Asynchronous work must not reinstall state after disposal. Keep fork, Remote, cancellation, archive, and late-resolution behavior covered by focused tests.

## Development commands

```sh
pnpm install
pnpm run typecheck
pnpm run build
pnpm --dir packages/citeciter test
```

The repository tracks `packages/citeciter/lib/`; rebuild it whenever source or build configuration changes. `prebuild:bundle` removes stale top-level chunks before tsdown emits the Host manifests and Client bundle. Run `git diff --check` before committing. Browser and HMR smoke instructions live in the package README and `docs/implementation-milestones.md`.

## Documentation and release hygiene

- Keep the root and package READMEs consistent with the published package name, version, and supported DSH peer range.
- State early-development limitations directly; do not describe planned work as implemented.
- Never commit credentials, local machine paths, temporary DSH homes, generated test sessions, screenshots from disposable profiles, npm configuration, or pack tarballs.
- Keep release contents constrained by the package `files` allowlist and inspect both `npm pack --dry-run` and the real tarball before publishing.
- Use focused, logically separated commits. Do not force-push the public `main` branch.
