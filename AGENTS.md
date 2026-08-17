# CiteCiter contributor guidance

CiteCiter is an external browser plugin for DeepSeek Harness (DSH). It is built on Cordis and must remain installable without modifying the DSH repository.

## Read before changing the plugin

- `packages/citeciter/README.md` and `README.zh.md` describe current behavior.
- `docs/implementation-milestones.md` records reproducible checks.
- `.agents/notes/implemented/architecture/2026-08-17-citeciter-explainer-lifecycle.md` owns the explainer lifecycle decisions.
- `DESIGN.md` is historical research, not current implementation authority.
- Follow the upstream [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md), [development guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/development.md), and [contribution guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/CONTRIBUTING.md).

## Architecture requirements

- Cordis registrations are reversible effects. Every listener, slot registration, subscription, and other side effect must be disposed with its plugin fiber.
- CiteCiter remains a client plugin. Use the maintained DSH client runtime and slot APIs rather than patching the DSH shell or agent loop.
- Resolve selected conversation keys through the parent session snapshot and use the resulting `anchorSeq`; never parse an event sequence from the key text.
- Fork the child at a completed parent boundary, switch it to `read-only`, require a matched successful permission command, and only then send the explanation prompt.
- Never write model-visible input to the parent session. Explanation prompts, answers, cancellation, and errors belong to the child log.
- Treat HTML and SVG model output as untrusted. Preserve the current network-free iframe CSP, scriptless sandbox, and SVG safety checks.
- Asynchronous work must not reinstall state after disposal. Keep lifecycle behavior covered by focused tests.

## Development commands

```sh
pnpm install
pnpm run typecheck
pnpm run build
pnpm --dir packages/citeciter test
```

The repository tracks `packages/citeciter/lib/`; rebuild it whenever source or build configuration changes. Run `git diff --check` before committing. Browser and HMR smoke instructions live in the package README and `docs/implementation-milestones.md`.

## Documentation and release hygiene

- Keep the root and package READMEs consistent with the published package name and supported DSH peer versions.
- State early-development limitations directly; do not describe planned work as implemented.
- Never commit credentials, local machine paths, temporary DSH homes, npm configuration, or generated test sessions.
- Keep release contents constrained by the package `files` allowlist and inspect `npm pack --dry-run` before publishing.
- Use focused, logically separated commits. Do not force-push the public `main` branch.
