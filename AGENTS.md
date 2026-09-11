# CiteCiter agent instructions

CiteCiter is an external DSH plugin, not the DeepSeek Harness monorepo. Its package lives in `packages/citeciter/`. Use the [upstream architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [plugin conventions](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md) as design references, checking their revision against the installed artifact.

## Baseline and ownership

- CiteCiter 0.7 beta.2 targets DSH `0.1.5-rc.1` and Desktop `2.0.9`, as requested during the September 10 acceptance. The released 0.6 and earlier 0.7 preview targeted DSH `0.1.2-rc.1` and Desktop `2.0.5`. Alpha is a separate migration target.
- Keep behavior in plugins and documented services/events; do not patch the host Agent Loop.
- Host and Client compile separately with `tsconfig.host.json` and `tsconfig.client.json`. Their identically named services can have different types.
- Use ESM, strict TypeScript, `.ts` local imports and package names across packages. Use branded DSH identifiers from their owning packages.
- `CONTRIBUTING.md` lists this repository's commands. Do not claim nonexistent monorepo gates such as `doc-sync` ran here.

## Runtime and UI

- Registrations are effects. Use scoped injection, `ctx.effect()` and `ctx.on()`; release listeners, observers, controllers and private runtimes with their owner.
- Model-visible input must be reconstructable from the Topic log. Never append Topic work to source Sessions or expose workspace write tools to learning Topics.
- Runtime APIs use `isSeeded` and `inheritedEventCount`. Physical JSONL `seedLength` remains owned by DSH persistence; do not guess a data migration.
- Agent setup receives `(agentCtx, agent)`. Use the explicit Agent or event payload; do not discover it through `ctx.agent`.
- Client services assemble controllers. React receives snapshot selector hooks and business callbacks, without discovering Cordis services.
- UI contributions use public slots. The intentional host-layout exception is isolated in `src/client/host-dock.ts` and its CSS. Preserve the source conversation, native details and Desktop caption. Restore owned styles on close/dispose; unknown layouts must not get a full-screen fallback.
- Validate external JSON, configuration and persisted data at their readers; trust typed same-process calls. Waterfall handlers call `next()` unless intentionally claiming the request.
- Public APIs document parameters, results and non-obvious lifecycle obligations. Empty catches identify the harmless failure swallowed.

## Validation and docs

- Focus tests on behavior. Run typecheck, relevant unit tests and build; changes to Topic output/lifecycle also run `pnpm test:snapshot`, which boots a real disposable DSH profile with a keyless provider.
- Check wide/narrow layouts, maximum proportion, native details, close/reopen and Desktop modes separately.
- Use a disposable DSH home and separate port. Never stop another DSH process or share one home between active processes.
- Tracked `lib/` is part of the release. Rebuild it, check a packed tarball in a clean profile, and run `git diff --check`.
- Nontrivial changes include an Agent Note under `.agents/notes/` covering final decisions, evidence and limits. Archived notes are frozen.
- Keep root/package Chinese and English READMEs aligned. Update release notes and JSDoc with the code. One physical line per paragraph; one trailing newline per file.
- Never commit credentials, `.env`, `.npmrc`, temporary homes, sessions, screenshots or tarballs. Building a release candidate does not publish it.
