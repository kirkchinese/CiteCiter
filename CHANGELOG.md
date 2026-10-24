# Changelog

All notable changes to CiteCiter. Detailed notes for each published version are on [GitHub Releases](https://github.com/kirkchinese/CiteCiter/releases). Versions are listed with the DSH host line they target.

## 0.9.0-beta.4 — 2026-10-25

Targets DSH `0.2.0-rc.2` (including the official Desktop), `0.2.1-alpha.1` through `0.2.1-alpha.5`, `0.2.1-rc.1`, `0.2.1-rc.2` and `0.2.1-rc.3`.

### Host support

- Support DSH `0.2.1-rc.3`.

### Workspace

- Citer is a tab in DSH's right sidebar, with an entry on the sidebar's guide page. It sits beside files, terminals and other plugins' tabs, and DSH splits, floats, fullscreens and closes it like them; the desktop pet, the shortcut and the toolbar open it. Hosts without the right sidebar keep Citer's own panel.
- The interface follows DSH's language setting, Chinese or English, through DSH's locale service, so language packs can add languages. Built-in actions change their names and prompts with the language one by one, also after you edit, add or reorder other actions; actions you edited or added stay as written.
- Each Topic shows its token usage, cache hit rate and context occupancy under the composer.
- DSH's plugin page shows Citer by name with its mascot and a description, and its page holds Citer's settings.

### Selection

- The toolbar starts with 引用 (Quote): a passage selected in the main conversation is added as a blockquote to the main conversation's own composer, so the next message to the main agent names the sentence it is about; in a Topic it goes to that Topic's composer. Nothing is sent. When the main composer holds reference chips that the host cannot keep while appending, the quote is copied to the clipboard instead.
- Your own messages in the main conversation can be selected for actions too.

### Topic context

- Every Topic's prompt names its source conversation, and Citer can read it without the source attachment being sent first, also in Topics that quote nothing.
- Without a model set for new Topics, a new Topic uses the model currently selected in the source conversation's composer, not the last one that ran.

### Topic transcript

- Citer's codebase notices and source excerpts, previously hidden, appear in the Topic like DSH's own context rows: the role (injected or recalled context), the producer and, for notices, a one-line summary, expanding to the exact text the model received. As in DSH's chat, ordinary context such as the runtime, time and skill catalog stays out of the transcript; 显示全部上下文 in the Topic menu lists it too.
- Citer's own context messages use DSH's context forms (`notice` with a summary for codebase changes, `recall` for source excerpts), so DSH and other plugins can present them. Topics written by earlier versions read as before.
- Tool calls use DSH's views: file reads with line numbers, edits as coloured diffs with line counts, commands as "运行命令" with their description, output and exit code, searches as grouped results, codebase diffs highlighted, and a finished question card as its questions and answers. `run_code` child calls appear inside their parent. Unknown tools keep the arguments and result view. The file a read or edit touched opens in DSH's right sidebar from the row.
- Failures and "已停止" markers stay in the history after later answers, as in DSH. A tool still without a result when its turn ends shows as interrupted instead of running forever. Images in an answer are shown.
- Learning-stage messages show the source and excerpt as reference chips instead of their serialized text.
- Selecting text in a Topic's own answers or tool output shows the Citer toolbar too; actions continue that Topic with the passage attached as an excerpt.

### Fixes

- Codebase change notices arrive at the start of every turn, not only the first one, on DSH `0.2.1-rc.3`.
- A model configured for new Topics that this DSH cannot serve (for example a provider set up only on another machine) no longer makes preset actions fail: the Topic is created with its references, the action waits in the composer and Citer asks for an available model. Nothing is sent automatically. Retrying an action uses the model setting as it is now, and the notice no longer blames the source model.
- Settings → 新 Topic 的模型 also applies to Topics created from the panel.
- Permanently deleting a Topic also deletes its codebase snapshots, which held copies of your files.
- Selecting part of a tool result in the conversation cites that part, not the whole raw output, and `run_code` child results can be cited.
- Board animations: with board animations off or reduced motion requested, the board stays on the final frame and cannot be played; the scrubber still shows single frames. The board keeps the proportions of the frames Citer inspects, so a checked frame matches what you see; narrow panels switch to the notes/canvas view; citation labels no longer show HTML entities; small SVGs in answers keep their size.
- Settings: reordering actions keeps the editor on the same action; an invalid shortcut is refused with an inline message instead of being saved. Cancelling a Topic rename returns focus to the title.

## 0.9.0-beta.3 — 2026-10-22

Targets DSH `0.2.0-rc.2` (including the official Desktop), `0.2.1-alpha.1` through `0.2.1-alpha.5`, `0.2.1-rc.1` and `0.2.1-rc.2`.

### Host support

- Support DSH `0.2.1-rc.1` and `0.2.1-rc.2` (npm `latest`, also the base of the community DSH NEXT shell) and the preview line `0.2.1-alpha.3` through `0.2.1-alpha.5`; their compatibility gates refuse 0.9.0-beta.2. Citer still supports the official Desktop `0.2.0-rc.2` and DSH `0.2.1-alpha.1` / `0.2.1-alpha.2`.
- The DSH peer `@deepseek-ai/dsh-util-values` is no longer required.

### Topic context

- Citer reads the source conversation as a Markdown transcript: user and assistant messages, tool calls and tool results, each marked with its source position. Long tool output and edit diffs are shortened by default, and Citer can re-read a single record in full. Edits appear as line diffs.
- Codebase change awareness: at the start of each turn Citer is told which files changed in the git working tree since its previous turn, uncommitted changes included, and can read line-level diffs with the new `workspace_changes` tool. Settings choose a file list (default), attached diffs, or off. Snapshots live in the Topic's own directory as separate git objects; the repository is never written.
- Board animations: the new `blackboard_animate` tool moves existing board elements along one timeline with verbs (appear, move, scale, rotate, highlight, reveal), keyframes, SVG paths or restricted math expressions, with narration beats. The board can be played, paused, scrubbed and stepped by beat; it rests on the final frame when board animations are off or the system asks for reduced motion. `blackboard_view` can render chosen moments of the timeline so Citer checks its own animation.
- An optional automatic source excerpt, off by default, adds the source's newest records at the start of each turn once the source attachment has been sent.

### Fixes

- The composer's model, reasoning and permission choices and the Topic menu use DSH's own menu, and Citer's buttons use DSH's icons (including its permission glyphs), so they look and behave like the host and follow host themes. This also centers the arrow on the model button, which used to sit below the text.
- When a preset action cannot be sent and moves into the composer, the panel says so once instead of repeating the composer's own notice. Notices above the composer (an unavailable model, draft errors, an unconfirmed send) use the host's small secondary text, and their recovery buttons look like links.
- When another plugin adds a message to a Topic with a source that DSH's session format no longer saves (no source, or the retired `{ kind: "plugin" }` form), Citer logs a warning naming that source, so the plugin that breaks the Topic's persistence can be identified.

## 0.9.0-beta.2 — 2026-10-15

Targets DSH `0.2.0-rc.2` (including the official Desktop), `0.2.1-alpha.1` and `0.2.1-alpha.2`.

### Selection and actions

- Selecting text in the conversation, a tool result or a document shows a toolbar with the first four actions; the rest and "ask in a new Topic" are under "⋯". The right-button wheel is optional and off by default, so the browser keeps its context menu unless the wheel is turned on in Settings.
- Preset actions (explain, find errors, translate, …) send at once as their own message with the selected source and excerpt, without touching an existing draft; the question action still opens the composer. A setting switches presets back to filling the composer. If the host refuses a direct send, for example because the model is unavailable, the action moves into the composer.
- Actions go to the open, unarchived Topic by default and create a Topic only when there is none or the user asks for a new one. Per-slot targets saved by earlier versions are ignored.
- New Topics keep the excerpt or question as their title until DSH's own first-prompt title provider summarizes them; a rename still pins the title. This adds the DSH peer `@deepseek-ai/dsh-session-title-first-prompt-llm`, which every supported host already includes.

### Interface

- The panel, menus, settings and dialogs use DSH's colors, type scale, radii, dividers and controls, and message text follows the DSH content font size. Decorative backgrounds, the byline above answers, internal status text and raw tool JSON are gone. The interface calls the plugin Citer.
- Tool rows show readable titles and summaries, such as "读取来源对话 · 12 条记录"; reference chips show the excerpt and the source conversation's title.
- The header shows a status only while answering or after an error. The Citer mark replaces the drag grip and the collapse button joins the header. Rename, archive, deletion, the document reader and the learning route are in the Topic menu; the learning-card tab appears once a Topic has cards.
- While Citer is closed, a desktop pet peeks over the window edge, stands up when the pointer comes near, opens Citer on click and can be dragged to either side; a dot marks a finished answer or a waiting question. It replaces the large round launcher and its Topic count. The floating reader button, which covered the host status bar in narrow windows, is removed; open the reader from the Topic menu.
- Settings are regrouped like DSH's own sections, with host switches and segmented controls.

## 0.9.0-beta.1 — 2026-10-10

Targets DSH `0.2.0-rc.2` (including the official Desktop), `0.2.1-alpha.1` and `0.2.1-alpha.2`. Includes everything from the unpublished 0.9.0-alpha.4 candidate.

### Host support

- Support the official DeepSeek Harness Desktop `0.2.0-rc.2` and DSH `0.2.1-alpha.1` / `0.2.1-alpha.2`. Earlier npm versions are refused by these hosts' compatibility gate ([#13](https://github.com/kirkchinese/CiteCiter/issues/13)). Community desktop builds are no longer supported.
- The repository root is now an installable plugin entry, so `dsh plugin add git+https://github.com/kirkchinese/CiteCiter.git#<ref>` and the Desktop plugin page's Git field work without a build step.
- Load shared DSH modules through the host's profile resolution. This fixes Topics that failed to restore on some official Desktop launch paths.

### Question cards and drafts

- Unsent answers to `ask_user_question` cards are saved per Topic, including choices, free text and the current page, and survive reloads and restarts. After a host restart an interrupted card is restored and waits for a manual answer; cancelled or stopped questions are not restored.
- Paging and submitting are separate buttons, so "Next" can no longer submit the whole card.
- Drafts save silently. Edits from several windows merge automatically; overlapping edits keep the window you are typing in. IME composition is never interrupted by a remote save.

### Tools, deletion and UI

- Tool calls, including PTC sub-calls, show success, failure, cancellation, interruption and explicit approval rejection. Question replies render as readable user messages.
- Permanent deletion writes a minimal receipt (identity and cleanup state only), so other windows release the Topic and late requests cannot recreate it.
- The image preview close button avoids the official Desktop title bar. Draft images that cannot be decoded show "无法预览" and keep the original file.
- A model failure already shown in the transcript no longer repeats as a banner.
- Appending to an existing Topic from the wheel focuses the composer once the panel is laid out.
- Board citations keep the text inside SVG and HTML diagrams.

### Removed

- The private Topic runtime used by versions before 0.8, together with Exact Fork mode. Every Topic is now a native DSH Session in its source's `citeciter/` directory. Topics still stored in the pre-0.8 layout are migrated automatically at startup when their source is available; the original logs are kept.
- Settings that no longer had an effect: default Topic mode, "allow investigating the source workspace" (applied only to pre-0.8 Topics), prompt templates and the wheel slot's content type. Values saved by earlier versions are ignored, and an invalid saved value now falls back to its default without resetting the other settings.
- The `select-model` request and the 0.3.1 `citation` create request.
- The `availableThroughSeq` field of `read_source_session`; `sourceMaxSeq`, `hasMore` and `nextFromSeq` describe paging.
- Ten DSH peer dependencies that only the private runtime used, so the host compatibility check has fewer packages to match.

## 0.9.0-alpha.3 — 2026-09-28

Targets DSH Web `0.1.7-rc.2`.

- Fix IME composition in the Topic composer (typing `ni` could produce `nni你`). Loaded drafts update synchronously; saving stays in the background.
- Remove the flickering "saving draft" text; save failures still surface.

## 0.9.0-alpha.2 — 2026-09-28

- Update checks understand prerelease versions, so an alpha `latest` tag no longer reports `registry-version-invalid`.

## 0.9.0-alpha.1 — 2026-09-28

Targets DSH Web `0.1.7-rc.2`.

- Fix installation and Typert activation on DSH `0.1.7-rc.2` ([#9](https://github.com/kirkchinese/CiteCiter/issues/9)).
- Drafts (text, references and attachment bytes) persist per Topic and restore after refresh or restart without sending.
- Free questions append to the selected, unarchived Topic; other built-in wheel actions create a new Topic. Wheel actions open the composer directly.
- Images and files from tools render under the tool card; history images open in the host lightbox.
- Learning-card examples distinguish prose from code; the learning route is off by default.
- Board screenshots work after the panel closes; archived Topics restore when a new message is accepted.
- A Topic may cite several documents; document tools report exact ranges and continuation offsets.

## 0.8.2 — 2026-09-14

Targets DSH Web `0.1.5-rc.1`.

- `read_source_session` reports `sourceMaxSeq`, `hasMore`, `nextFromSeq` and `readScope`, so models no longer mistake a short window for the whole source.
- Restore the three suggested follow-up questions after a native Topic's first answer.

## 0.8.1 — 2026-09-14

- Fix Topics failing to open on Linux when the DSH launcher is a symlink. 0.8.0 is deprecated.

## 0.8.0 — 2026-09-14 (deprecated)

Targets DSH Web `0.1.5-rc.1`. Includes the unpublished 0.7.0 betas.

- New Topics are native DSH sessions stored under the source session's `citeciter/` directory, using the host's agent preset, models, permissions, attachments, queue and approvals. Older Topics are migrated with their original logs kept.
- Creating a Topic or choosing a wheel action only prepares a draft; the model runs after a manual send. Source and excerpt references are removable draft attachments.
- New Topics are read-only by default.
- Eight-slot selection wheel, native file-preview entry, floating/docked panel, learning cards with Markdown export, optional learning route and active recall.
- `blackboard_view` lets vision models inspect the rendered board.

## 0.6.0 — 2026-09-07

Targets DSH Web `0.1.2-rc.1` on Windows.

- Adapt to the new session, sandbox, question and client APIs; Host and Client compile separately.
- The panel keeps a readable main conversation, moves below it in narrow windows and restores the host layout on close.

## 0.5.0 — 2026-09-03

Targets DSH Web `0.1.1-rc.1` / `0.1.1-rc.2`.

- Free Topics without a citation, Presenter blackboard (protocol v4), document Reader, tool-result citations, permanent deletion and update notices.

## 0.4.3 — 2026-08-28

- Restore citing committed intermediate model calls and reasoning text (regressed in 0.4.2).

## 0.4.2 — 2026-08-28

- Fix selections in lists and nested lists that could not be mapped back to the answer.

## 0.4.1 — 2026-08-26

- Fix leaked follow-up markup, stalled pagination on oversized source events and duplicate work on retries.

## 0.4.0 — 2026-08-22

- Move to DSH `0.1.1-rc.1` / `0.1.1-rc.2`.

## 0.3.2 — 2026-08-22

- Reliability fixes for selection mapping, Topic creation, model switching and lists. Targets DSH Web `0.1.0-rc.7`.

## 0.3.1 — 2026-08-21

- Read-only `glob` / `grep`, structured user questions and expandable tool rows.

## 0.3.0 — 2026-08-21

- Private Observer Topics: cite a committed model call while the source agent keeps running.

## 0.2.1 — 2026-08-18

- Fix later follow-ups being rejected after the read-only switch.

## 0.2.0 — 2026-08-18

- Durable Citation Threads with custom questions and follow-ups.

## 0.1.1 — 2026-08-17

- Add the DSH bundle declaration so `dsh plugin add` mounts the plugin.

## 0.1.0 — 2026-08-17

- First release: explain a selected passage of a DSH Web answer in a side panel.
