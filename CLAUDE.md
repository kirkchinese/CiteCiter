# CiteCiter

CiteCiter is an external DSH plugin (npm `@kirkchinese/dsh-citeciter`), not the DSH monorepo. [CONTRIBUTING.md](CONTRIBUTING.md) owns commands, layout, architecture and the release steps; [docs/product.zh.md](docs/product.zh.md) owns product rules. For DSH design rules read its [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/AGENTS.md), [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) and [defensive patterns](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/defensive-patterns.md), and check APIs against the installed DSH version rather than `master`.

## Design rules

- Behavior lives in plugin contributions and documented DSH services. Never patch the Agent Loop. The three host adaptations (`citer-session-access.ts`, `host-agent-modules.ts`, `client/host-dock.ts`) stay isolated in their modules.
- Registrations are effects (`ctx.effect()`, `ctx.on()`) released with their owner; disposal waits for Agents and requests to settle. Waterfall listeners call `next()` unless they deliberately claim the request.
- Model-visible input must be reconstructable from the Topic log. Never write to source Sessions.
- Creating a Topic or choosing an action only prepares a draft; only a manual send runs the model. New Topics are read-only by default.
- Citer owns `<source session>/citeciter/`. Never modify source logs, other Topics or migration backups. Keep Topic metadata readable by earlier versions unless a migration is deliberately designed.
- Validate at file, wire and configuration boundaries; trust typed same-process calls. Read persisted settings field by field.
- Host and Client compile separately. React components receive snapshots and callbacks and never look up Cordis services.
- ESM, strict TypeScript, `.ts` local imports, package names across packages. Exports carry concise JSDoc for non-obvious contracts; an empty `catch` names the error it swallows.

## Checks

- Before committing source changes run `pnpm typecheck`, `pnpm typecheck:desktop`, `pnpm test`, `pnpm build` (it also checks the Git entry and package READMEs) and `git diff --check`, and commit the rebuilt `lib/`.
- On Windows a build can fail with `TS5033 Could not write file` while another process holds `lib/types`; rerun it.
- Static checks and unit tests do not prove behavior. Verify user-visible changes in a real DSH with a real model. Never run two hosts on one DSH home, and preserve the user's main DSH home and sessions.

## Documentation

- Document current state, one home per fact: README for users, CONTRIBUTING for developers, the product doc for rules, CHANGELOG for history. No commit hashes, validation logs, per-change agent notes or status annotations.
- Keep `README.md` (Chinese) and `README.en.md` aligned; regenerate the package READMEs with `pnpm sync:readme`. Add a CHANGELOG line under `Unreleased` for every user-visible change.
- One physical line per paragraph; one trailing newline per file.

## Working with the user

- The user writes Chinese; reply in Chinese. Code, comments and commit messages are English.
- Ask before publishing to npm, pushing, creating GitHub releases or comments, deleting remote branches, or touching anything outside the repository (`.refs/` belongs to the user).
- Never commit credentials, `.env`, `.npmrc`, sessions, screenshots or tarballs.
