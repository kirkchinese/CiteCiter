# CiteCiter agent instructions

CiteCiter is an external DSH plugin, not the DeepSeek Harness monorepo. Its package lives in `packages/citeciter/`. Use the [upstream architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [plugin conventions](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md) as design references, checking their revision against the installed artifact.

## Baseline and ownership

- CiteCiter 0.8 alpha.1 targets DSH `0.1.5-rc.1` and Desktop `2.0.9`, as requested during the September 10 acceptance. The released 0.6 and earlier 0.7 preview targeted DSH `0.1.2-rc.1` and Desktop `2.0.5`. Alpha is a separate migration target.
- Native learning preview is optional. Its public types and pure address utility target resolved subpackages `0.1.5-rc.2`; the top-level DSH version alone does not guarantee this service.
- Keep behavior in plugins and documented services/events; do not patch the host Agent Loop.
- Citer owns `.dsh/sessions/<workspace>/<sourceSession>/citeciter/`, including Topic logs, archive state and deletion. Preserve source logs and migration backups. Citer members must not appear in the Host list.
- The intentional native checkpoint adapter is isolated in `src/citer-session-access.ts`: get/flush route exact owned identities, list remains unchanged, and original property descriptors are restored on teardown. Do not expand this exception to the Agent Loop or unrelated services.
- Host and Client compile separately with `tsconfig.host.json` and `tsconfig.client.json`. Their identically named services can have different types.
- Use ESM, strict TypeScript, `.ts` local imports and package names across packages. Use branded DSH identifiers from their owning packages.
- `CONTRIBUTING.md` lists this repository's commands. Do not claim nonexistent monorepo gates such as `doc-sync` ran here.

## Runtime and UI

- Registrations are effects. Use scoped injection, `ctx.effect()` and `ctx.on()`; release listeners, observers, controllers and private runtimes with their owner.
- Model-visible input must be reconstructable from the Topic log. Never append Topic work to source Sessions. Reuse DSH permissions, initially read-only; workspace modification requires the user's explicit mode selection or changed default. Creating a Topic or selecting an action only prepares a draft: model requests require manual submission. Source excerpts and addresses remain removable draft attachments until submission.
- Runtime APIs use `isSeeded` and `inheritedEventCount`. Physical JSONL `seedLength` remains owned by DSH persistence; do not guess a data migration.
- Agent setup receives `(agentCtx, agent)`. Use the explicit Agent or event payload; do not discover it through `ctx.agent`.
- Client services assemble controllers. React receives snapshot selector hooks and business callbacks, without discovering Cordis services.
- UI contributions use public slots. The intentional host-layout exception is isolated in `src/client/host-dock.ts` and its CSS. Preserve the source conversation, native details and Desktop caption. Restore owned styles on close/dispose; unknown layouts must not get a full-screen fallback.
- Validate external JSON, configuration and persisted data at their readers; trust typed same-process calls. Waterfall handlers call `next()` unless intentionally claiming the request.
- Public APIs document parameters, results and non-obvious lifecycle obligations. Empty catches identify the harmless failure swallowed.

## Validation and docs

- Run typecheck and build as static checks. Functional acceptance uses real models and real conversation branches in the main installed DSH. Record observed UI, backend and combined behavior; static checks alone do not establish functional correctness. Do not retain artificial model providers, test fixtures, or temporary test scripts.
- Check wide/narrow layouts, maximum proportion, native details, close/reopen and Desktop modes separately.
- Preserve the main DSH home and existing sessions. Remove owned development instances as requested; never share one home between active processes.
- Tracked `lib/` is part of the release. Rebuild it, install the packed candidate in the main profile for acceptance, and run `git diff --check`.
- Nontrivial changes include an Agent Note under `.agents/notes/` covering final decisions, evidence and limits. Archived notes are frozen.
- Keep root/package Chinese and English READMEs aligned. Update release notes and JSDoc with the code. One physical line per paragraph; one trailing newline per file.
- Never commit credentials, `.env`, `.npmrc`, temporary homes, sessions, screenshots or tarballs. Building a release candidate does not publish it.
