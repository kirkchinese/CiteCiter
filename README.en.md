# CiteCiter

[简体中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

**My AI agent finished the task. I still wanted to understand the work.**

CiteCiter helps you learn from your agent’s work, in context. Select part of a conversation, tool result or document, ask about it in an independent Topic that keeps its source, use a board to explore the relationships, and return to your task.

If an agent has written code or completed an analysis, but you cannot yet explain a key choice, confidently maintain the result or decide what to check, this plugin aims to help with that concrete gap. CiteCiter is a [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) plugin: it requires DSH and an available model. It is not a standalone chat application.

[![CiteCiter demo: learn from your agent’s work](assets/docs/video-cover.png)](https://www.bilibili.com/video/BV1tqeA65EJ8/)

[Watch on Bilibili](https://www.bilibili.com/video/BV1tqeA65EJ8/). This Chinese-language demo shows an earlier released version, including references, independent discussions and boards. Its interface may differ from the current release; it is not acceptance evidence for the latest official desktop application.

## Start with one question in your current task

For example, an agent changed your program and you want to know: “Why can this asynchronous save affect typing?”

1. Select the relevant text in the original conversation, tool output or document, then choose Ask or Explain from the right-click wheel.
2. Citer opens a draft with removable source-address and excerpt attachments. Write your question, select a model and send it yourself.
3. Ask follow-up questions about that material. Request a diagram, compare alternatives or save a learning card when useful.
4. Return to the task and check your understanding against code, tool results or a small experiment. The source conversation and Topic keep separate logs.

You do not need to plan a lesson or enable a learning route. Compared with starting another chat, Citer keeps sources, follow-up questions and related records in the working context, reducing repeated copying. Explanations and polished diagrams can still be wrong: they help you understand and inspect the work, but do not replace evidence.

## Installation and compatibility

**Desktop compatibility now targets the official DSH desktop application. Community desktop builds are no longer guaranteed to work.** The current official Windows download is DSH `0.2.0-rc.2`; its installer signature and version have been checked. Official installer: [Windows x64](https://download.deepseek.com/desktop/dsh-latest-windows-x64.exe).

| Host | Status as of October 7, 2026 |
| --- | --- |
| Official DSH Desktop `0.2.0-rc.2` | Installation contract and real usage under review; not yet accepted |
| npm DSH `0.2.0-rc.2` (`latest` / `next`) | Current adaptation target; not yet accepted |
| DSH `0.2.1-alpha.1` (`alpha`) | Source review in progress; not yet accepted |

The current candidate is **0.9.0-alpha.4**, with adaptation and acceptance still in progress; it has not been published. The published CiteCiter package is **0.9.0-alpha.3**, a prerelease built for DSH `0.1.7-rc.2`. Do not assume that installing it on the new host establishes compatibility or bypass host compatibility checks to force an older plugin to load.

### Git installation: public CLI verified, desktop UI flow still pending

This branch now exposes the plugin from the repository root. The official CLI `0.2.0-rc.2` has installed the pinned public GitHub commit below, with bundle registration, all four module entries and the Typert manifest verified. The official desktop application's pnpm `11.7.0` also passed installation of a real local Git snapshot. Fix commit `f8825a6` is on the public development branch `codex/official-desktop-october`; it has not been merged into `main`, and no new Release or npm package has been published. Git installation through the official desktop plugin page, restart loading from that installation and complete functional acceptance remain pending; the default branch URL is not yet a verified installation source.

This command pins the verified development commit **for candidate retesting only; it is not a recommended version with complete functional acceptance**:

```sh
dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#f8825a68ac80f2f26a4d4f8bdd2e7fd2ba3a2aea"
```

Use the same repository address with its commit or tag in the official desktop plugin page's Git field; that UI flow still needs acceptance. The entry uses prebuilt files committed to the repository, without a `#path:packages/citeciter` suffix, an install-time build or a redirect to a published npm package. See the [acceptance record](docs/validation/2026-10-07-official-desktop.md) for the exact scope and limits.

Configure models in DSH after installing a compatible plugin. The global CLI and the desktop application's embedded runtime are managed separately; do not run two writers against the same DSH home. Linux and macOS have no native acceptance conclusion in this round.

**0.8.0 is deprecated.** Launching DSH through a Linux symlink can prevent Topic creation or restoration with a missing `@deepseek-ai/dsh-agent-loop` error. Version 0.8.1 fixed the launcher path; 0.8.2 remains available only for the older DSH `0.1.5-rc.1` baseline. **Do not use 0.8.2 with DSH 0.1.7 or later:** its peer versions and Typert factory interfaces are incompatible, as documented in [Issue #9](https://github.com/kirkchinese/CiteCiter/issues/9). Alpha.1 / alpha.2 have an IME composition regression fixed in alpha.3. See [Releases](https://github.com/kirkchinese/CiteCiter/releases) for the full history.

## Available today

| What you want to do | What CiteCiter provides |
| --- | --- |
| Understand an answer, code fragment or tool result | Independent Topics with source references; follow-ups stay out of the source Session |
| Understand relationships and processes | A board supporting Markdown, math, tables, SVG, images and isolated HTML |
| Keep something to revisit | Exportable, editable learning cards with distinct text and code examples |
| Discuss real files | File and image attachments, document selections and an optional native preview entry |
| Continue from understanding to action | DSH models, tools, approvals, permissions, queuing and steering; new Topics start read-only |
| Pause and return later | Saved drafts, references and attachments restored after Topic changes, reloads or restarts, without automatic sending |

These describe the existing plugin's features; support on a newly released host still requires the compatibility checks above. Topics display model-provided reasoning, tool arguments and results. Models that return no reasoning do not produce an empty thinking row. Compatible host plugins can provide image generation and viewing tools; CiteCiter does not configure their accounts or automatically enable those capabilities.

## References, drafts and controls

Ask appends a real selection to the **selected, unarchived Topic in the current source**. It creates a Topic when none is selected or the selected Topic is archived. Other built-in actions create Topics by default; custom actions can choose their destination. Appending keeps the existing draft, model and permissions. The plus button selects real files and does not manufacture references.

Creating a Topic, choosing a wheel action, changing models and quoting a board only prepare a draft. References can be removed before sending; unsent drafts neither enter model logs nor grant source access. Previously submitted references remain part of conversation history: removing a later draft copy does not retract them.

The composer provides attachments, permission mode, model and reasoning level, then Send. Enter sends and Shift + Enter inserts a newline; Enter during IME composition does not submit. While a reply runs, Enter follows DSH's queuing or steering preference and Ctrl + Enter temporarily uses the other mode. Accepted manual submissions scroll to the latest message; streaming alone respects your position when reading earlier messages.

Drafts save silently in the background. Only the contents accepted by the host are cleared; edits made during submission survive. Failures retain the draft. Lost responses, multi-window conflicts and attachment recovery failures show explicit notices. Choosing to keep this window's draft restores attachment bytes that it still holds.

Select files from the attachment menu, paste images into the composer or drop files anywhere on the Citer panel. The drop hint names the receiving Topic and does not copy the files into the source conversation. Mixed paste keeps images and text. Submitted generic files can be downloaded; images open in the host preview.

Configure eight wheel slots, default models, prompts and reference destinations in settings, then save. A short right-click keeps the wheel open; Shift + right-click opens the native menu. Arrow keys, digits 1–8 and Enter also select actions. Escape, empty slots, source changes or wheel blur cancel.

## Learning and boards

**Learning route is off by default.** A single explanation, board or card request does not start a teaching plan. When enabled, the model selects appropriate stages through DSH todos; your requested scope, length, tool limits and card count take precedence. Active recall is also off by default. There is no spaced repetition, reminder or streak system.

Native Topics offer three suggested questions after their first answer by default; disable them in settings. The prompt asks the model to omit suggestions when you request only a result, impose a strict format or exclude suggestions. Clicking a suggestion fills the draft and still requires manual submission.

There is one board feature. Board quotations become draft attachments, and math renders as math. Card examples explicitly distinguish text from code; code retains language, indentation and a copy button, including code fences in exports. Card generation asks the model to check conclusions, conditions and calculations, but self-review does not ensure correctness.

An image-capable model can use `blackboard_view` to inspect the board's actual rendered image for clipping, arrows and layout. Offscreen rendering continues after Topic switches or panel closure, but the DSH page must stay connected. Captures exclude the source conversation. Sandboxed HTML iframes cannot currently be captured; use SVG for diagrams that need visual inspection.

Image tools come from compatible host plugins such as [Codex Connect](https://github.com/franksong2702/dsh-codex-connect). Image generation and `view_image` have separate switches and are configured per profile. Installing a provider alone does not enable these tools; new provider releases need their own integration checks.

## Permissions, sessions and layout

New Topics start **read-only**, even when the source Session has full access. Modification requires your explicit mode selection or a changed default. DSH approvals, sandboxes and tool restrictions remain in effect.

Topics appear only in Citer navigation. Double-click a title or press F2 to rename. Archiving keeps the records; an archived Topic returns to the active list when the host accepts a new manually submitted message. Permanent deletion requires the complete Session ID and removes only the owned Topic, leaving the source, other Topics and migration backups intact.

```text
.dsh/sessions/<workspace>/<sourceSession>/
├── session.v4.jsonl[.zstd]       DSH-owned source
└── citeciter/
    ├── owner.json              Source and directory ownership
    ├── <topicNumber>/
    │   ├── topic.json          Topic information
    │   ├── draft/              Unsent text, references and attachments
    │   └── sessions/…          Citer-owned session logs
    └── migration-backups/      Original migration copies
```

Migration reads and writes through public DSH persistence APIs, verifies logs before switching the index and keeps original copies. DSH owns session formats. Do not manually downgrade logs or rewrite event sequences or `seedLength`; unsupported newer formats refuse destructive writes.

Wide windows show the source and Citer side by side, with resizing and title-bar dragging to float or dock. Narrow windows use a separate page with a Back button. When space is insufficient, native file details take priority and Citer temporarily hides while keeping its draft. A separate adapter owns layout changes; unknown host layouts do not receive an intrusive full-screen fallback.

## Documents and known limits

Open Document reading from Citer's … menu to import `.txt`, `.md` or `.markdown`. The reader accepts up to 2,000,000 characters and displays at most 500 KiB of UTF-8 text per page. Document addresses and excerpts are independently removable references; multiple documents can join one Topic.

When the host provides the optional `documentPreviews` service, choose “CiteCiter 学习” from native file preview. Citing stores a complete snapshot unaffected by later file edits, limited to 8 MiB / 2,000,000 characters. This reader does not provide PDF text extraction, Word parsing or OCR.

Source and document tools provide pagination and explicit continuation positions. Source reads use `sourceMaxSeq` for the snapshot horizon and `hasMore` / `nextFromSeq` for continuation. Document offsets use UTF-16 and return the actual read range. See the [source-read fix](docs/releases/v0.8.2.md) and [document offset notes](docs/compatibility/document-unicode-offsets.md). An empty or budget-limited page does not prove that the source is missing.

The full host composer lacks a cross-session embedding interface: Citer reuses public session APIs but does not automatically inherit every third-party composer extension. A model's agreement, a successful tool call or a generated card is not proof that an explanation is correct.

## Why CiteCiter exists

Practice usually produces two things: an outcome and the ability to do better next time. Trying, making mistakes, comparing alternatives and checking results help us develop judgment. AI can take over more of the execution without automatically transferring that understanding to the person using it. Finishing a task and growing from it can become easier to separate.

AI may also lower the barrier to practice, allowing more people to build things they could not build before. We want to explore how those new opportunities become human capability. Even when an agent performs the work, people still need to set goals, understand important conditions, judge whether a result fits, and question or take over when something goes wrong.

CiteCiter tries to turn real AI work into material people can cite, question and check. Start with a question in the task in front of you, understand a principle, inspect evidence, then continue with a better understanding. The aim is to preserve opportunities to understand, judge and act independently while benefiting from AI's efficiency.

## Next steps and participation

These are directions to explore, **not shipped features or promised release dates**.

- **Real-task pilots:** Start with people who use agents but struggle to explain, maintain or accept the result. Observe onboarding friction, whether they return and whether they can explain one important decision.
- **Super mode:** Explore an explicitly enabled, off-by-default workflow for deeper evidence checks, counterexamples and small experiments, with clear time and model-call costs. Everyday use should stay lightweight and honest about uncertainty.
- **Cases and communication:** Build Chinese and English demos around actual problems. Share user outcomes only with permission and a clear account of the evidence.
- **Host compatibility:** Track public DSH extension APIs and the official desktop application. Let actual usage inform demand for other hosts.

Bring a task that “the agent finished, but I still cannot explain” to [Issues](https://github.com/kirkchinese/CiteCiter/issues). Include DSH and plugin versions, what you wanted to understand and where you got stuck. Remove credentials, private conversations and other sensitive material before sharing. Cases where the plugin did not help are valuable too.

## Development and acceptance

[Contributing](CONTRIBUTING.md) · [Product rules (Chinese)](docs/product-strategy.zh.md) · [Alpha.3 input fix](docs/releases/v0.9.0-alpha.3.md)

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm typecheck:desktop
pnpm build
```

Host and Client compile separately. Native session adapters, source reading, storage, attachments, queues, board capture and UI remain separate modules without changing the DSH Agent Loop. Static checks do not establish functional correctness: acceptance uses real models, real source branches and actual UI after installing the final package, recording passes and limits. Artificial model providers and temporary test scripts are not retained.

The author's related project [Claude2DSH](https://github.com/kirkchinese/claude2dsh) migrates and reuses conversations and assets between Claude Code and DSH. CiteCiter focuses on understanding and learning from those real working materials.

MIT License.
