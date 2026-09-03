# CiteCiter

**An AI-output learning, review, and correction plugin for DeepSeek Harness.**

Select part of an answer to ask follow-up questions, switch models, or create multiple independent Topics without interrupting the main task. You can also start a free Q&A or Presenter Topic and let AI explain with formulas, diagrams, tables, and animation on the main-workspace blackboard.

[中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Report an issue](https://github.com/kirkchinese/CiteCiter/issues) · [Join the community](#community) · [⭐ Star CiteCiter](https://github.com/kirkchinese/CiteCiter)

<p align="center">
  <img src="assets/hero/citeciter-hero.png" width="100%" alt="The CiteCiter mascot turns a selected AI answer into multiple independent Topics">
</p>

## Install

CiteCiter 0.5.0 requires Node.js `^22.19.0 || >=24.0.0` and DSH Web `>=0.1.1-rc.1 <0.1.1-rc.3`.

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.5.0
dsh plugin --profile web list --depth 0
```

Confirm that the list shows `@kirkchinese/dsh-citeciter@0.5.0`, then restart DSH Web and refresh the page. Existing Topics, settings, and source Sessions need no migration or rewrite. This release ships a Web installation path only; Desktop work remains deferred.

## Get started

- Select answer or reasoning text from a committed assistant model call, right-click, enter a question, then choose Start Q&A or Start presenting.
- Open the right-side CiteCiter workspace, choose `+ New Topic`, then select Q&A or Presenter. In a new source Session, send one main-conversation message first so CiteCiter can reuse its model route.
- Continue the Topic, switch its model or reasoning effort, rename it, archive it, restore it, or permanently delete it.
- Presenter boards appear under the main workspace's Blackboard tab. Quote to question appends the board reference to the existing draft.

<p align="center">
  <img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="Select part of an AI answer and keep asking questions in CiteCiter">
</p>

## Main features

- **Verifiable source binding.** CiteCiter rechecks visible selections against committed answers. A committed intermediate model call can be cited while the surrounding source turn continues.
- **Side investigations.** Observer Topics persist independently and can read source events or workspace files without changing the source Session or repository.
- **Multiple entry points.** Start from assistant selections, tool results, terminal output, code diffs, free Topics, or text and Markdown documents in the Reader.
- **Presenter blackboard.** Atomic `blackboard_apply` commits build formulas, Markdown, tables, safe SVG, isolated HTML animation, and embedded images. Failed commits leave the previous board intact.
- **Complete Topic lifecycle.** Follow up, switch model and reasoning effort, rename, archive, restore, or permanently delete with Session-ID confirmation.
- **Responsive side-by-side UI.** Wide layouts show the main conversation, learning workspace, and Topic rail together. Tighter layouts collapse the rail or fall back to an overlay.
- **Version update notices.** When npm has a newer stable release, Web shows Update, Next time, and Never remind me. Update copies an install command; it never changes the environment automatically.

## Compatibility and limitations

- DSH Web `0.1.1-rc.1` and `0.1.1-rc.2` are supported. Users on DSH `0.1.0-rc.7` should remain on CiteCiter 0.3.2.
- DSH has no public right-dock extension point yet, so CiteCiter uses a reversible layout adapter that must be retested for each DSH update.
- Exact Fork requires a completed source turn. Uncommitted streaming text has no stable citation coordinates.
- DSH rc.2 has no Session deletion API, so permanent deletion operates only on CiteCiter-owned storage. Multiple active CiteCiter processes must not share one DSH home.
- Desktop and TUI are not supported yet.

## Developer API

0.5.0 provides the v1 Host service `ctx.citeciterRuntime` (`create`, `ask`, `get`, `list`, and `delete`) plus the `citeciter/topic-created`, `citeciter/topic-updated`, and `citeciter/topic-deleted` events. Browser entry registration, presets, and a separate client face remain in M4/M5, so frontend extension APIs are not stable yet.

## Roadmap

### Completed

- [x] **v0.3.1–v0.4.3** Topic management, cross-turn selection, model switching, complex Markdown selection, and committed-intermediate-output fixes.
- [x] **v0.5.0** EvidenceRef v4, multiple entry points and Reader, free Topics, Presenter blackboard, permanent deletion, Host v1 API, shortcut/prompt settings, and Web update notices.

### Next

- [ ] Replace board polling with host push and evaluate handwritten annotation workflows.
- [ ] Finish developer API M4/M5: public entry and preset registration, client face, compatibility matrix, and example plugin.
- [ ] Adapt to DSH Desktop and publish in its plugin marketplace.

## Development and contributing

Source development requires Node.js `^22.19.0 || >=24.0.0` and pnpm `11.21.0`.

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Topic data lives in `$DSH_HOME/citeciter/workspaces/`; Topic logs live in `$DSH_HOME/citeciter/sessions/`. Issues and pull requests are welcome.

## Community

Join the DSH-Citeciter QQ group (`1108040435`).

<p align="center">
  <img src="assets/community/qq-group.jpg" width="280" alt="QR code for the DSH-Citeciter QQ group 1108040435">
</p>

## License

CiteCiter is open source under the [MIT License](LICENSE).
