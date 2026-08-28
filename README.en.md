# CiteCiter

**An AI-output learning, review, and correction plugin for DeepSeek Harness.**

Select part of an answer to ask follow-up questions, switch models, or create multiple independent Topics without interrupting the main task. Use it to understand new ideas, find mistakes, or check whether a long-running task is going off track.

[中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Report an issue](https://github.com/kirkchinese/CiteCiter/issues) · [Join the community](#community) · [⭐ Star CiteCiter](https://github.com/kirkchinese/CiteCiter)

<p align="center">
  <img src="assets/hero/citeciter-hero.png" width="100%" alt="The CiteCiter mascot turns a selected AI answer into multiple independent Topics">
</p>

## Install

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.2
```

Restart DSH Web and refresh the page after installation.

## Get started

Select part of an answer. Right-click, ask a question, then `Citer!`.

<p align="center">
  <img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="Select part of an AI answer and keep asking questions in CiteCiter">
</p>

## What can CiteCiter do?

### Understand and learn

When a concept, derivation, or conclusion does not make sense, Citer it and let AI explain.

### Compare and correct

Not sure about something? Citer it and let different models help you find omissions, contradictions, and mistakes.

### Check long-running tasks

Want to know what an Agent is doing? Citer it to check the current progress and direction, and see whether the Agent got anything wrong.

### Build your own workflow

CiteCiter wants to be a foundation you can build on. Start from your own content and goals, then gradually develop the way of using it that works for you.

## Main features

- **Observer mode.** Start multiple Citer conversations from the same answer without disrupting the context of the main conversation.
- **Switch models.** Change the model and reasoning effort separately.
- **Persistent history.** Keep your Citer history.
- **Agent capabilities.** Models in a Citer conversation can inspect the source conversation and investigate the codebase.
- **Responsive interface.** Adjust the panel layout to the window width.

## Community

Join the DSH-Citeciter QQ group to share how you use CiteCiter, suggest features, and ask for help.

<p align="center">
  <img src="assets/community/qq-group.jpg" width="280" alt="QR code for the DSH-Citeciter QQ group 1108040435">
</p>

## Development roadmap

The roadmap starts with v0.3.1, when CiteCiter officially began moving from a rough prototype to something usable.

### Completed

- [x] **v0.3.1** Added management, archiving, and recovery. Added tools for the internal AI. Added the question tool. The CiteCiter whale girl joined the UI.
- [x] **v0.3.2** Added cross-turn selection. Added reasoning-effort and model switching. Improved parts of the user experience. Added next-question prediction.
- [x] **v0.4.0** Adapted to the new DSH rc.1 and rc.2. Fixed several bugs.
- [x] **v0.4.1** Fixed several bugs and improved the UI and conversation logic.
- [x] **v0.4.2** Fixed Citer creation from lists, nested lists, and other structurally complex answers.

### Planned

- [ ] **Blackboard** Give AI a small blackboard. AI can stream and control HTML, animations, images, equations, and other elements on the board to explain things to the user. Users can ask questions while watching the board—like having a teacher beside them.
- [ ] **More Citer entry points** Start a Citer from tool output, terminal results, and code diffs.
- [ ] **Books and papers** Move beyond AI conversations and start a Citer from books, papers, and other content.
- [ ] **Developer API** Provide user-defined shortcuts and prompts, plus a general API that other plugins can call.
- [ ] **DSH Desktop support** Adapt CiteCiter for DSH Desktop and join its plugin marketplace.

## Development and customization

To modify CiteCiter, start from the source. You will need Node.js `^22.19.0 || >=24.0.0` and pnpm `11.21.0`. Current development targets DSH rc.2 and remains compatible with rc.1.

```sh
git clone https://github.com/kirkchinese/CiteCiter.git
cd CiteCiter
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

- [`packages/citeciter/src/index.ts`](packages/citeciter/src/index.ts): Host entry point.
- [`packages/citeciter/src/client/`](packages/citeciter/src/client/): Right-click entry point, panel, and settings interface.
- [`packages/citeciter/src/topic.ts`](packages/citeciter/src/topic.ts) and [`topic-runtime.ts`](packages/citeciter/src/topic-runtime.ts): Topic data and runtime logic.
- [`packages/citeciter/tests/`](packages/citeciter/tests/): Regression tests.
- [`packages/citeciter/lib/`](packages/citeciter/lib/): Build output. Remember to rebuild after changing the source.

Topic data is stored in `$DSH_HOME/citeciter/workspaces/`. Conversation logs are stored in `$DSH_HOME/citeciter/sessions/`.

There is no stable developer API for other plugins yet. If you want to build your own version, fork the project for now and merge upstream changes when needed.

## Contributing

Issues and pull requests are welcome.

If CiteCiter helps you, please [star the project](https://github.com/kirkchinese/CiteCiter). Your star motivates me to keep building it.

## License

CiteCiter is open source under the [MIT License](LICENSE).
