# CiteCiter

[简体中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Changelog](CHANGELOG.md) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

![CiteCiter](assets/hero/citeciter-hero.png)

**The AI finished the task. I still want to understand how it did it.**

CiteCiter is a [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) plugin that helps you learn from your agent's real work. Select part of a conversation, a tool result or a document, ask about it in a separate Topic that keeps its source, use a blackboard to see how the pieces relate, then return to your work. The main conversation is never modified.

<p align="center"><img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/docs/media/citer-demo.gif" alt="Select a sentence in DSH and Citer explains it in the right sidebar" /></p>

[![CiteCiter demo](assets/docs/video-cover.png)](https://www.bilibili.com/video/BV1tqeA65EJ8/)

[Watch the demo on Bilibili](https://www.bilibili.com/video/BV1tqeA65EJ8/) (recorded with an earlier version; the interface has changed slightly).

## Installation

CiteCiter needs DSH and a working model. The plugin declares a range of DSH versions, so later releases on the same DSH line load without waiting for a CiteCiter update; outside the range DSH refuses to load it. Choose the CiteCiter release that matches your DSH:

| DSH version | CiteCiter version |
| --- | --- |
| `0.2.0-rc.2` and later, before `0.2.3` (including the official Desktop and every `0.2.1` and `0.2.2` alpha, release candidate and final release) | `0.9.0-beta.8` |
| `0.2.0-rc.2` and later, before `0.2.2` | `0.9.0-beta.7` |
| `0.1.7-rc.2` | `0.9.0-alpha.3` |
| `0.1.5-rc.1` | `0.8.2` |
| `0.1.2-rc.1` | `0.6.0` |

**Official Desktop:** install the npm package `@kirkchinese/dsh-citeciter` from the Plugins page, or enter `https://github.com/kirkchinese/CiteCiter.git` in its Git field, then restart when prompted.

**CLI and Web:**

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.9.0-beta.7
```

You can also install a release tag straight from the repository, which contains the built plugin, so nothing is built at install time:

```sh
dsh plugin --profile web add "git+https://github.com/kirkchinese/CiteCiter.git#v0.9.0-beta.7"
```

Restart DSH and refresh the page after installing or upgrading. Do not use `dsh plugin allow-version` to force a plugin that does not match your host version. Do not run two host processes on the same DSH home.

## Start from one question

Say your agent changed some code and you wonder: "Why does this async save affect typing?"

1. Select the relevant text in the conversation, a tool result or a document; the Citer toolbar appears next to it.
2. Click 解释 (explain) to get an explanation right away, or 提问 (ask) to put the source and the excerpt into the composer as removable attachments, write your own question and send it.
3. Keep asking about the material; when it helps, have the model draw the flow on the blackboard or summarize learning cards.
4. Go back to the task and check your understanding against the code, a tool result or a small experiment.

Creating a Topic or choosing 提问 only prepares a draft; preset actions such as 解释 and 翻译 send when you choose them, or only fill the composer if you change that in Settings. Explanations and boards can still be wrong; they help you understand and check, not replace evidence.

## Features

| You want to | CiteCiter provides |
| --- | --- |
| Understand an answer, code or tool result | A separate Topic with a source citation; follow-ups never touch the main conversation |
| See relationships and processes | A blackboard with Markdown, formulas, tables, SVG, images and sandboxed HTML; vision models can inspect the rendered board and fix it; board elements can be animated with keyframes, paths or formulas, and you can play, pause, scrub and step through the animation |
| Keep what you learned | Learning cards you can export and revise, with prose and code examples shown separately |
| Discuss real files | File and image attachments; read imported Markdown / text documents and workspace files in the right sidebar, select to ask, with citations that carry line numbers and lead back to the source |
| Act on what you understood | DSH models, tools, approvals, permissions, queueing and steering; new Topics are read-only by default |
| Pick up where you left off | Drafts (text, references, attachments) and unsubmitted question answers are saved and restored after switching, refreshing or restarting, never sent automatically |

## Using CiteCiter

**Toolbar and actions.** After you select text in an assistant answer, your own message, a tool result (including the command and arguments on a command card) or a document, a toolbar appears next to it: the first action (Ask Citer by default), then Quote, then the next three actions; the rest plus "Ask in a new Topic" are under "⋯". Quote puts the selected sentences into the main conversation's composer as a quote chip that looks like an `@file` chip, keeping the text and attachments already there. When you send, the main agent receives the exact passage and who said it (its reply, your message or a tool result), so it knows which sentence your next words are about, which helps when you discuss or dispute an answer. From DSH `0.2.1-rc.2`, sent messages show the quote as a chip too. Actions go to the open Topic by default, or create one when there is none or it is archived. Selecting text in Citer's own answers shows the toolbar too; the action continues that Topic, and Quote adds the passage to that Topic's composer. Ask Citer opens the composer for your own question; preset actions such as Explain, Find errors and Translate send directly without touching an existing draft. Action names, prompts and order are configurable in Settings. If you prefer gestures, turn on the wheel in Settings: hold the right mouse button (or the chosen key) after selecting text, move to an action and release.

**Right sidebar.** Citer is a tab in DSH's right sidebar. Open it from the sidebar's guide page, the desktop pet or the toolbar; it sits beside files, terminals and other plugins' tabs, and can be split, floated or made fullscreen like them; closing the tab closes Citer. If you prefer the standalone panel of earlier versions, turn on "Don't use DSH's right sidebar" under Settings → Citer → Panel. The interface follows DSH's language setting (Chinese or English), and so do the names and prompts of the default actions; actions you changed stay as you wrote them. Each Topic shows its own usage under the composer: tokens, cache hit rate and context occupancy.

**Documents.** Choose "Open document" in Citer's empty state, or import a `.md` / `.txt` file from the Documents page of the Topic list; the document opens as a tab in the right sidebar. Markdown is typeset (headings, lists, code blocks, math), text and code show line numbers, and long documents render as you scroll. Selecting text shows the same toolbar, so Ask Citer, Explain and Quote all work. A Topic asked from a document shows "document · line N" under its quote; "Open source" returns to that passage and briefly highlights it. Workspace files (including files opened by an absolute path, and common code, configuration, data and ROS files) open in DSH's own file preview; choose "Citer Reading" in its view menu to select and ask the same way, and asking saves a snapshot of the file to Citer's documents. The Documents page of the Topic list searches and deletes documents; deleting removes only the document, and the Topics about it keep their conversations. Without DSH's right sidebar, documents open as a tab inside Citer's panel.

**Desktop pet.** While Citer is closed, its mascot peeks over the window edge; she stands up when the pointer comes near, and a click opens Citer. Drag her to either side at any height and the place is remembered. A small dot appears next to her when an answer finishes, a question waits for you or teacher mode has a point for you while Citer is closed.

**Composer.** The composer offers attachments, permission mode, model and reasoning effort, and Send. Enter sends, Shift + Enter adds a line, and Enter never sends during IME composition. While a reply is generating, Enter follows DSH's queue/steer preference and Ctrl + Enter uses the other one. Add files from the attachment menu, paste images, or drop files onto the Citer panel.

**Drafts.** Drafts save silently in the background. Edits to the same Topic from several windows merge automatically; where they overlap, the window you are typing in wins. After a successful send, only what was sent is cleared, and anything written meanwhile is kept.

**Source and codebase.** Every Topic knows which main conversation it belongs to, so Citer can read it at any time, even in a Topic that quotes nothing (and only that conversation). It reads a transcript of user and assistant messages, tool calls and results, each marked with its position; long tool output is shortened first and read in full only when needed. Turn on the automatic source excerpt in Settings to add the source's newest records at the start of each turn; it is off by default. 代码库变化感知 (codebase change awareness) lists, at the start of each turn, the files that changed in the git working tree since Citer's previous turn, uncommitted changes included; Citer reads line-level diffs with a tool when they matter. Settings can attach the diffs directly or turn the notice off. Both are recorded in the Topic log and shown as expandable context rows holding the exact text the model received; your repository is never written. A Topic lists all the context its model received (source excerpts, codebase changes, time and so on) by default; the Topic menu can narrow the list to context notices. Of DSH's runtime facts a Topic keeps only the working directory, sent when it changes, and DSH's skill catalog is not sent to Topics. When a model request is retried, a Topic shows the retries and the failure reason as DSH's main conversation does. Tool calls in a Topic use DSH's views too: file reads with line numbers, edits as diffs, commands with their output and exit code.

**Teacher mode.** Turn it on under Settings → Citer → Learning; it is off by default. When on, each time the main conversation you are looking at completes a turn, Citer has the teacher-mode check model (when unset, the Citer model, then the main conversation's) look at that turn for a point worth stopping to understand; routine file reads and commands do not count. When it finds one, a "Worth noticing" note appears beside the pet (at the top of Citer when it is open). Explain opens a Topic that reads that turn and teaches the point on the blackboard; Dismiss puts it away. Each turn is checked once and costs one small extra model request, so a cheap, fast model can be chosen for it.

**Learning route and cards.** The learning route is off by default and can be turned on in the Topic menu (⋯); when on, the model plans its explanation with DSH todos. You can ask for learning cards at any time; the model checks conclusions, conditions and calculations first, but self-checking does not guarantee correctness. Active recall is off by default; when on, cards show their self-test question first.

**Codex Connect.** CiteCiter is adapted to the community plugin [Codex Connect](https://github.com/franksong2702/dsh-codex-connect) (`dsh-codex-connect`). With it installed and enabled in the same profile, Topics can use its ChatGPT / Codex models and GPT Image tools, and generated images appear under the tool card. Its image tools are enabled separately in Codex Connect's settings; see its documentation for installation, sign-in and supported DSH versions.

## Permissions and data

New Topics are **read-only** by default, even when the source session has more permissions. A Topic can change the workspace only after you choose another permission mode in the composer or change the default for new Topics in Settings; DSH approvals and sandboxing still apply.

Topics appear only in the Citer list, never in DSH's session list. A new Topic starts with the excerpt or question as its title, and DSH's title service summarizes it on the first answer; rename it by double-clicking the title, pressing F2 or using the Topic menu, after which the title no longer changes on its own; an archived Topic returns to the list when you send to it again. Permanent deletion asks for the full Session ID and removes only that Topic's records, drafts, attachments and codebase snapshots.

New Topics use the model for new Topics set in Settings, or, when it is unset, the model currently selected in the source conversation's composer. If that model does not exist in this DSH (for example a setting made on another machine), the Topic is still created with its references and draft, and Citer asks you to pick an available model in the model menu; it never switches models or sends on its own. A model that only cannot be reached for now, because of the network or a timeout, does not ask you to switch.

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
    │   ├── workspace/        codebase snapshots for change awareness (separate git objects)
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

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and [docs/product.zh.md](docs/product.zh.md) (Chinese) for the product rules. [Claude2DSH](https://github.com/kirkchinese/claude2dsh), by the same author, migrates sessions and assets between Claude Code and DSH.

MIT License.
