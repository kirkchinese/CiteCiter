# CiteCiter

[简体中文](README.zh.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Changelog](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/CHANGELOG.md) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

![CiteCiter](https://raw.githubusercontent.com/kirkchinese/CiteCiter/v0.9.0-beta.1/assets/hero/citeciter-hero.png)

**The AI finished the task. I still want to understand how it did it.**

CiteCiter is a [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) plugin that helps you learn from your agent's real work. Select part of a conversation, a tool result or a document, ask about it in a separate Topic that keeps its source, use a blackboard to see how the pieces relate, then return to your work. The main conversation is never modified.

[![CiteCiter demo](https://raw.githubusercontent.com/kirkchinese/CiteCiter/v0.9.0-beta.1/assets/docs/video-cover.png)](https://www.bilibili.com/video/BV1tqeA65EJ8/)

[Watch the demo on Bilibili](https://www.bilibili.com/video/BV1tqeA65EJ8/) (recorded with an earlier version; the interface has changed slightly).

## Installation

CiteCiter needs DSH and a working model. The plugin declares exact host versions, so choose the CiteCiter release that matches your DSH:

| DSH version | CiteCiter version |
| --- | --- |
| `0.2.0-rc.2` (including the official Desktop), `0.2.1-alpha.1`, `0.2.1-alpha.2` | `0.9.0-beta.1` |
| `0.1.7-rc.2` | `0.9.0-alpha.3` |
| `0.1.5-rc.1` | `0.8.2` |
| `0.1.2-rc.1` | `0.6.0` |

**Official Desktop:** install the npm package `@kirkchinese/dsh-citeciter` from the Plugins page, or enter `https://github.com/kirkchinese/CiteCiter.git` in its Git field, then restart when prompted.

**CLI and Web:**

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.9.0-beta.1
```

You can also install a release tag straight from the repository, which contains the built plugin, so nothing is built at install time:

```sh
dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#v0.9.0-beta.1"
```

Restart DSH and refresh the page after installing or upgrading. Do not use `dsh plugin allow-version` to force a plugin that does not match your host version. Do not run two host processes on the same DSH home.

## Start from one question

Say your agent changed some code and you wonder: "Why does this async save affect typing?"

1. Select the relevant text in the conversation, a tool result or a document, hold the right mouse button to open the wheel, and choose 自由提问 (free question) or 解释这段 (explain this).
2. Citer opens a draft with the source address and the excerpt as removable attachments. Write your question, choose a model, and send it yourself.
3. Keep asking about the material; when it helps, have the model draw the flow on the blackboard or summarize learning cards.
4. Go back to the task and check your understanding against the code, a tool result or a small experiment.

Creating a Topic or choosing a wheel action only prepares a draft; the model runs only after you send. Explanations and boards can still be wrong; they help you understand and check, not replace evidence.

## Features

| You want to | CiteCiter provides |
| --- | --- |
| Understand an answer, code or tool result | A separate Topic with a source citation; follow-ups never touch the main conversation |
| See relationships and processes | A blackboard with Markdown, formulas, tables, SVG, images and sandboxed HTML; vision models can inspect the rendered board and fix it |
| Keep what you learned | Learning cards you can export and revise, with prose and code examples shown separately |
| Discuss real files | File and image attachments, a `.txt` / `.md` document reader, and a "CiteCiter 学习" entry in native file previews |
| Act on what you understood | DSH models, tools, approvals, permissions, queueing and steering; new Topics are read-only by default |
| Pick up where you left off | Drafts (text, references, attachments) and unsubmitted question answers are saved and restored after switching, refreshing or restarting, never sent automatically |

## Using CiteCiter

**Wheel and citations.** After selecting text, hold the right mouse button to open the eight-slot wheel, move to an action and release. A short right click lets you click a slot, Shift + right click keeps the browser menu, the arrow keys, digits 1–8 and Enter also select, and Esc cancels. 自由提问 adds the selection to the selected, unarchived Topic, or creates one if none is available; other actions create a new Topic by default. Slots, prompts, the default model and where the panel opens are all configurable in Settings.

**Composer.** The composer offers attachments, permission mode, model and reasoning effort, and Send. Enter sends, Shift + Enter adds a line, and Enter never sends during IME composition. While a reply is generating, Enter follows DSH's queue/steer preference and Ctrl + Enter uses the other one. Add files from the attachment menu, paste images, or drop files onto the Citer panel.

**Drafts.** Drafts save silently in the background. Edits to the same Topic from several windows merge automatically; where they overlap, the window you are typing in wins. After a successful send, only what was sent is cleared, and anything written meanwhile is kept.

**Learning route and cards.** The learning route is off by default; when on, the model plans its explanation with DSH todos. You can ask for learning cards at any time; the model checks conclusions, conditions and calculations first, but self-checking does not guarantee correctness. Active recall is off by default; when on, cards show their self-test question first.

**Images.** Image generation and viewing tools come from host plugins such as [Codex Connect](https://github.com/franksong2702/dsh-codex-connect), enabled separately in each profile.

## Permissions and data

New Topics are **read-only** by default, even when the source session has more permissions. A Topic can change the workspace only after you choose another permission mode in the composer or change the default for new Topics in Settings; DSH approvals and sandboxing still apply.

Topics appear only in the Citer list, never in DSH's session list. Double-click a title or press F2 to rename it; an archived Topic returns to the list when you send to it again. Permanent deletion asks for the full Session ID and removes only that Topic's records, drafts and attachments.

CiteCiter stores its data in each source session's directory:

```text
.dsh/sessions/<workspace>/<sourceSession>/
├── session.v4.jsonl[.zstd]   main session managed by DSH (never modified by Citer)
└── citeciter/
    ├── owner.json            directory ownership
    ├── <topicNumber>/
    │   ├── topic.json        Topic information
    │   ├── draft/            unsent text, references and attachments
    │   ├── question-drafts/  unsubmitted question answers
    │   └── sessions/         the Topic's own session log
    └── deleted/              deletion records (identity only, no content)
```

Topics created before 0.8 are migrated into this layout at startup; their original logs are kept.

## Known issues

- On Windows, PowerShell in read-only mode may report a language-mode error or print garbled Chinese. This is a limitation of the DSH executor inside the read-only sandbox; CiteCiter does not loosen permissions to work around it.
- After the official Desktop restarts, other browser tabs still connected to the old backend may go blank; refreshing restores them. This also happens with CiteCiter disabled.
- Using different DSH versions one after another at the same browser address can leave the host's own draft data in an incompatible format so the main conversation does not render; use a different address or port per version.
- The plugin is mainly tested on Windows; Linux and macOS have not been systematically tested, and reports are welcome.

## Why CiteCiter

Practice usually produces two things: a result and a skill. We form judgment by trying, making mistakes, comparing approaches and verifying. AI can take over more and more of the execution, but it does not automatically hand the matching understanding to its user, so finishing a task and growing as a person can come apart.

CiteCiter turns real AI work into material you can cite, question and check. Start from the question in front of you, understand the principle, look at the evidence, and continue with a better understanding. Even when an agent does the work, people still need to set goals, understand the key conditions, judge whether a result applies, and take over when something goes wrong.

## Feedback

Bring a task where "the agent finished, but I still can't explain it" to the [issue tracker](https://github.com/kirkchinese/CiteCiter/issues). Include your DSH and plugin versions and whether you got stuck installing, citing and asking, or understanding the answer. Remove keys and private content before pasting material.

See [CONTRIBUTING.md](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/CONTRIBUTING.md) for development and [docs/product.zh.md](https://github.com/kirkchinese/CiteCiter/blob/v0.9.0-beta.1/docs/product.zh.md) (Chinese) for the product rules. [Claude2DSH](https://github.com/kirkchinese/claude2dsh), by the same author, migrates sessions and assets between Claude Code and DSH.

MIT License.
