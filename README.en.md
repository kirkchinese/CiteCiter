# CiteCiter

[简体中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

CiteCiter is a learning plugin for DeepSeek Harness. It creates independent Topics from conversations, tool results or imported documents, with explanations, boards and learning cards. Questions, answers and tool records stay in a private Topic log while the source conversation continues.

![CiteCiter 0.7 workspace diagram](assets/docs/learning-workspace.svg)

This is a layout diagram. Wide windows show the source and learning panel side by side; smaller windows place the panel below the source.

## Versions and hosts

| Plugin | Status | Host baseline |
| --- | --- | --- |
| 0.6.0 | Published stable release | DSH 0.1.2-rc.1 / Desktop 2.0.5 |
| 0.7.0-beta.3 | Development branch; not published to npm | DSH 0.1.5-rc.1 / Desktop 2.0.9; five learning stages, wheel and cards |
| 0.5.0 | Earlier host support | DSH 0.1.1-rc.1 / rc.2 |

The features below describe the 0.7 development build. Installing 0.6.0 does not provide the five-stage route or learning cards. Desktop means [anywhere-labs/dsh-desktop](https://github.com/anywhere-labs/dsh-desktop). Node.js requires `^22.19.0 || >=24.0.0`; local acceptance uses Windows and Node 24.19.0. The development target is DSH 0.1.5-rc.1 / Desktop 2.0.9; alpha, next and TUI are outside this scope.

## Selection wheel

![Eight-slot wheel, question and model selection, side and floating presentations](assets/docs/selection-wheel.svg)

This is an interaction diagram, not a runtime screenshot. The wheel, question form and floating panel use translucent glass, background blur and short animations, with reduced-motion and increased-contrast styles.

Select text, hold the right mouse button, move toward an action, check its highlight, then release. Direct actions use the default model in settings, or follow the source when none is configured. Actions marked as requiring input open a question form and model selector before submission.

| Slot, clockwise from the top | Default action | Input | Default location |
| --- | --- | --- | --- |
| 1 | Free question | Required | Side |
| 2 | Explain passage | None | Side |
| 3 | Find errors | None | Floating |
| 4 | Translate | None | Floating |
| 5 | Quantitative board | None | Side |
| 6 | Summary cards | None | Side |
| 7, 8 | Empty | — | — |

The centre, empty slots, outside of the wheel, Escape, blur and source changes cancel the action. A short right-click leaves a clickable wheel; arrow keys move, Enter confirms, and digits 1–8 choose directly. Shift + right-click preserves the native menu. Tool entries cite the whole tool card; readers cite selected text.

In Settings → CiteCiter → Selection wheel, choose the trigger and default model. Triggers include right mouse, Alt/Option, Control, Shift and Meta/Command. Each slot has a name, prompt, input requirement, Q&A/learning scenario and side/floating presentation. Move, clear or restore slots, then save all eight together. Custom modes retain the Topic's read-only tool boundary.

Submission blocks duplicate execution. Failures retain the question, model and source for retry; switching source Sessions cancels unsent actions. A Topic creation already accepted by the host is not rolled back. Mode prompts are ordinary user messages in the Topic log.

## Native file preview

Choose “CiteCiter 学习” in DSH's native preview renderer selector. The host owns opening, reading and refreshing files; CiteCiter displays selectable UTF-8 source text. Use the wheel or selection-actions button. Text, Markdown and common source-code files are supported. Starting learning saves a complete snapshot; later file edits do not rewrite it. Native learning uses the same 500 KiB pagination.

This entry registers through the optional documentPreviews service. The local top-level DSH package is 0.1.5-rc.1, while its resolved document preview package is 0.1.5-rc.2; the relevant development dependencies are pinned to rc.2. Without this service, the conversation wheel, standalone reader and Topics remain available. The top-level version alone does not establish native preview capability.

Files need a source Session address; absolute file addresses cannot directly create a learning Topic. A snapshot is limited to 8 MiB and 2,000,000 characters. This entry does not intercept selections in built-in Markdown, code, PDF or HTML renderers, and does not provide PDF text layers, Word parsing or OCR.

## Learning workflow

1. Select committed assistant answer or reasoning text in the source conversation, then start an action through the wheel. Tool results also provide citation entries. Use `+ New Topic` for a free discussion or learning explanation.
2. Choose a stage, add a question if needed, and send. Stages can be skipped, repeated or replaced with a free follow-up. Selecting a stage does not call the model.
3. Switch between Explain, Board and Learning Cards. The board defaults to readable entries; its canvas preserves spatial relationships.
4. Choose Summary Cards and send. Once the model submits a complete set through `learning_cards`, read, export or revise it through a follow-up.

| Stage | Requested output |
| --- | --- |
| Underlying logic | Definitions, mechanisms and conditions |
| Qualitative analysis | Trends, boundaries, counterexamples and intuition |
| Quantitative analysis with a board | Variables, units, assumptions, derivations and examples; explain when quantification does not apply |
| Concept connections | Prerequisites, related concepts, distinctions and applications |
| Summary learning cards | Conclusions, examples, self-test questions and reference answers |

**Active recall is off by default.** Cards normally show conclusions and examples. When enabled, they show a question first and reveal reference content on demand. There are no scheduled reviews, reminders, streaks or mastery scores.

Suggestions and board citations append to the draft; the user sends it. Board citations retain the selected learning stage; switch to Free Follow-up for a direct explanation. `Ctrl / ⌘ + Enter` sends; Enter inserts a newline. Stage instructions are ordinary user messages in the Topic log. Selecting a stage does not imply mastery.

## Document reading

Open 📖 and import a `.txt`, `.md` or `.markdown` file. The Reader stores the full text and displays pages of at most 500 KiB in UTF-8. Each import accepts up to 2,000,000 characters. Navigate with Previous / Next, select a passage, enter a question and click `Citer!`.

Successful creation closes the Reader and opens the learning panel. Failures preserve the selection and question for retry. Changing pages clears the old selection and keeps the question. Markdown is displayed as source text; PDF, Word, web-page extraction and OCR are not supported directly.

Reading Topics can read and search imported documents. When “Allow source project files” is enabled, they also receive read-only project search and file-reading tools. They cannot modify files or execute commands.

## Topic management and layout

| Control | Behavior |
| --- | --- |
| Top Topic selector | Switch Topics belonging to the current source conversation |
| Topic settings | Rename, select model and reasoning effort, archive or delete |
| Stop | Stop the current generation, then continue with a follow-up |
| View archived | Show archived Topics; restoring returns them to the active list |
| Permanent deletion | Requires the complete Topic Session ID; does not delete the source |
| Side / Floating | Retain the Topic and drafts; drag the floating panel by its header |
| Close panel | Restore the host layout; reopening preserves drafts within this page |

The preferred panel proportion is 28%–55%. Wide layouts reserve a separate column and at least 480 CSS pixels for the source conversation. If native details leave insufficient room, the panel moves below the source. Narrow layouts fold stage navigation and the reading-view composer, which can be expanded. CiteCiter overlays hide while a host modal is open and return when it closes. Native sidebar fullscreen hides the side panel and offers an explicit floating-view action; leaving fullscreen restores the side panel. Moving learning below the source is a space fallback, not another learning workflow. Switch to floating for continued comparison.

Content uses public slots. A version-specific adapter in `host-dock.ts` reserves layout space. Unknown layouts show a compatibility message. Gesture handling, action state, execution, document sources and React views are separate modules. Host upgrades require another acceptance pass.

## Data and limits

![Source, private Topic log and learning output data flow](assets/docs/data-flow.svg)

| Data | Persistence |
| --- | --- |
| Questions, answers, stage requests and board | Stored in the private Topic log and restored after restart |
| Learning cards | Latest successfully committed complete set; older sets remain in the log; invalid or incomplete records preserve the previous set |
| Card export | Manual Markdown download containing cards, Topic identity and the source quote |
| Wheel configuration and default model | Host CiteCiter settings |
| Unsent drafts, temporary view selections and floating position | Kept within the page; not restored after reload or restart |
| Imports and native file snapshots | Stored in `$DSH_HOME/citeciter/documents/` |

Observer reads committed source events as needed. Exact Fork inherits context from a completed source turn. Topics never append events to the source Session. Boards support formulas, Markdown, tables, safe SVG, isolated HTML and embedded images with rendering restrictions.

Topic indexes live in `$DSH_HOME/citeciter/workspaces/`; private logs live in `$DSH_HOME/citeciter/sessions/`. Without an explicit `DSH_HOME`, the usual location is `.dsh` under the user directory. DSH owns old-log format migration. Read-only opens preserve original files; resumed writes publish the current format through the host. Exact Fork uses the restored inherited boundary. Historical quotations retain their text; captured event numbers can change after host migration. Back up the entire home before upgrading. Concurrent Web and Desktop instances must use separate homes.

Models control their explanation and tool calls; selecting a stage does not guarantee that a model produces a board or card set. There is no independent card editor, cross-Topic search, knowledge-graph database or cross-device synchronization.

## Install the local 0.7 development build

Use `0.7.0-beta.3` with the current host. Stable `0.6.0` targets the older host; see its [release notes](docs/releases/v0.6.0.md). Run these commands from this branch's repository root:

```powershell
npm install -g @deepseek-ai/dsh@0.1.5-rc.1
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm test:snapshot
pnpm --dir packages/citeciter pack --pack-destination "$PWD/.refs/artifacts"
$env:DSH_HOME = Join-Path $env:USERPROFILE '.dsh-citeciter-preview'
dsh plugin --profile web add "$PWD/.refs/artifacts/kirkchinese-dsh-citeciter-0.7.0-beta.3.tgz"
dsh --profile web --host 127.0.0.1 --port 10537 --no-open
```

For the first Web visit, open the complete login URL printed by the host, including `?token=…`. DSH sets a session cookie and redirects to the URL without the token; subsequent reloads can use that address. Omitting the initial login parameter returns HTTP 401, which some browser automation tools report as `ERR_BLOCKED_BY_CLIENT` for this text response. Treat the login URL as a host credential; do not copy it into documentation or Git.

Install Desktop [2.0.9](https://github.com/anywhere-labs/dsh-desktop/releases/tag/v2.0.9) separately; updating the global CLI does not update its bundled runtime. If npm blocks dependency scripts, allow the specific packages listed by npm for that installation. Choose an unused port. For Desktop, launch the application with a separate `DSH_HOME`, then run `dsh plugin add <absolute tarball path>` in its managed terminal. The global CLI cannot manage the reserved `desktop` profile. Run only one host per home. Restart the host and refresh the client after installation.

`test:snapshot` uses a keyless model in a disposable real DSH profile to verify stages, boards, cards, restart recovery and management operations. Deterministic tests verify software behavior, not teaching quality. See the [acceptance record](docs/validation/2026-09-11-wheel.md) for results and coverage limits.

See [Contributing](CONTRIBUTING.md) for development and packaging, and the [0.7 development notes](docs/releases/v0.7.0-beta.3.md) for changes. Building or packing does not publish to npm.

## Community and license

DSH-Citeciter QQ group: `1108040435`. License: [MIT](LICENSE).
