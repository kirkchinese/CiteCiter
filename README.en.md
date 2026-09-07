# CiteCiter

**A learning and investigation companion for DeepSeek Harness Web and Desktop.**

Select a committed response and explore it in a private Topic while the main task continues. Ask follow-ups, change models, or let the presenter explain with formulas, diagrams, tables and animations.

[简体中文](README.md) · [npm](https://www.npmjs.com/package/@kirkchinese/dsh-citeciter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

<p align="center"><img src="assets/hero/citeciter-hero.png" width="100%" alt="Explore selected AI output in private CiteCiter Topics"></p>

## 0.7 learning workspace (development preview on this branch)

The stable release is [0.6.0](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.6.0), now available through npm `latest`. This branch is **0.7.0-beta.1**, a development preview not published to npm. The commands below continue to install stable 0.6.0.

The learning route is **underlying logic → qualitative analysis → quantitative analysis (board) → concept connections → summary learning cards**. Select or skip any stage, then send to begin. Free follow-ups remain available. New learning presentations start with underlying logic. Quantitative work must identify variables, units, assumptions and examples, or explain why quantification is inappropriate.

- Explain, Board and Learning Cards share the learning panel. Topic navigation moves to the header; model, title and management controls expand on demand. Narrow windows collapse stage navigation by default to preserve reading space.
- All Topic scenarios can use boards and cards. Panel boards default to readable entries, with an optional canvas for spatial relationships. The native blackboard view remains available.
- `learning_cards` saves a complete card set in the Topic log. Reopening or restarting restores it. A later summary displays the latest complete set while older sets remain in the log. Export Markdown or request a revision through a follow-up.
- **Active recall is optional and off by default**. Read conclusions and examples directly, or turn it on to answer a question before revealing reference material. There is no spaced repetition, due-date queue or check-in system.
- Suggested questions and board citations append to the draft before sending. Drafts survive Topic switching and panel close/reopen within the page; unsent drafts do not survive page refresh or restart. `Ctrl/⌘ + Enter` sends; Enter inserts a newline.

Try the source in a separate test home:

```powershell
$env:DSH_HOME = "$PWD/.refs/learning-preview"
pnpm install --frozen-lockfile
pnpm build
dsh plugin --profile web add "$PWD/packages/citeciter"
dsh --profile web --host 127.0.0.1 --port 10529 --no-open
```

Desktop previews need another independent home and a local package installation in the selected profile. See the [0.7.0-beta.1 development notes](docs/releases/v0.7.0-beta.1.md) for evidence and limits. Card quality depends on the model. Cross-Topic search, an independent manual card editor, a knowledge-graph database and cross-device synchronization are not implemented.

## Install and compatibility

CiteCiter **0.6.0** targets DSH `0.1.2-rc.1` and [DSH Desktop 2.0.5](https://github.com/anywhere-labs/dsh-desktop/releases/tag/v2.0.5). Node.js must satisfy `^22.19.0 || >=24.0.0`; Windows validation uses Node 24.19.0. DSH alpha and Desktop master are separate targets.

| Environment | Installation target | Status |
| --- | --- | --- |
| DSH Web 0.1.2-rc.1 | `web` profile | Windows runtime and UI verified |
| DSH Desktop 2.0.5 | Current Desktop profile, default `desktop` | Targeted; see release notes for mode-specific checks |
| DSH 0.1.1-rc.1 / rc.2 | Older environment | Keep CiteCiter 0.5.0 |
| DSH alpha, TUI | — | Unsupported |
| Linux / macOS | Same package | 0.6.0 Linux CI passed; Linux/macOS UI untested |

Install or upgrade the Web plugin:

```powershell
npm install -g @deepseek-ai/dsh@0.1.2-rc.1
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.6.0
dsh plugin --profile web list --depth 0
dsh web
```

Confirm version 0.6.0, restart the owning host and refresh the page. Alternatively, download the `.tgz` from the [GitHub Release](https://github.com/kirkchinese/CiteCiter/releases/tag/v0.6.0) and replace the package name with the tarball's absolute path. See Contributing for a local workspace installation.

For Desktop, confirm its selected profile and data directory, then install using the **same DSH_HOME**:

```powershell
dsh plugin --profile desktop add @kirkchinese/dsh-citeciter@0.6.0
dsh plugin --profile desktop list --depth 0
```

Replace `desktop` if a custom profile is selected; set `$env:DSH_HOME` in PowerShell if it uses a custom home. Restart Desktop. Updating the global npm CLI does not replace Desktop's embedded runtime.

If npm 12 blocks the native dependency scripts listed by this DSH release, allow them for this installation:

```powershell
npm install -g @deepseek-ai/dsh@0.1.2-rc.1 --allow-scripts=@deepseek-ai/dsh-subprocess-local,koffi,node-pty,@google/genai,protobufjs
```

This addresses native installation. An old plugin importing the removed `effectiveSandboxMode` export requires a plugin upgrade; reinstalling the host alone does not fix it.

## Stable 0.6.0 workflow

1. Select committed assistant answer or reasoning text, right-click, enter a question, and choose “开始提问” or “开始讲解”.
2. Continue in the learning panel, change model/reasoning effort, and manage Topic titles, archives and deletion.
3. Use `+ 新 Topic` for a free question or presentation. A new source session needs its first message before the Topic can reuse its model route.
4. Presenter boards appear in the main workspace's “小黑板” tab. Board citations append to the current question draft.
5. Tool results, terminal output, diffs and the text/Markdown Reader also provide Topic entry points.

<p align="center"><img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="Select AI output and continue in a CiteCiter Topic"></p>

This older recording demonstrates the citation workflow; host layout and controls differ in 0.6.

## Keep the source conversation visible

- Wide windows allocate a separate learning column and retain native details.
- Saved panel proportions range from 28% to 55%. Actual width is capped to leave at least 480 CSS pixels for conversation, then returns to the preference when space permits.
- Narrow or zoomed windows place the learning panel in a bottom row, with the conversation visible above it.
- Closing restores host layout. Unrecognized frames show a compact compatibility message.

Content uses public DSH slots, conversation projections and snapshot hooks. This release has no public right-dock sizing service, so a small maintained host adapter allocates space. Revalidate it after host upgrades.

## Topics and data

Observer discussions use private logs and read source events or project files as needed. Exact Fork inherits context from a completed source turn. File tools remain read-only and Topics never append to the source Session. Uncommitted streaming text has no stable citation position; Exact Fork requires a completed source turn.

Atomic `blackboard_apply` commits support formulas, Markdown, tables, safe SVG, isolated HTML animations and embedded images. Topics support follow-ups, model changes, archive/restore and permanent deletion with a Session ID confirmation.

Indexes live under `$DSH_HOME/citeciter/workspaces/`; logs under `$DSH_HOME/citeciter/sessions/`. Without the variable the home is usually `.dsh` in the user directory. Back up the complete home before upgrading. Version 0.6 uses the new runtime API without bulk-rewriting old logs. DSH's version-0 physical JSONL still uses `seedLength`; preserve and diagnose unknown events rather than deleting fields.

Only one active CiteCiter host may own a home. Concurrent Web and Desktop instances need different homes. Update notices copy a command without installing anything; Desktop commands target the current profile.

## Development

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:snapshot
```

The real application snapshot uses a temporary profile and keyless model for Observer, Exact Fork, source reads, boards and source-log isolation. Host `ctx.citeciterRuntime` exposes `create`, `ask`, `get`, `list`, `delete` and Topic change events. Public frontend entry registration and preset extension APIs remain unfinished. See [Contributing](CONTRIBUTING.md) and the [0.6.0 release note](docs/releases/v0.6.0.md).

## Community and license

DSH-Citeciter QQ group: `1108040435`.

<p align="center"><img src="assets/community/qq-group.jpg" width="280" alt="DSH-Citeciter QQ group QR code"></p>

[MIT License](LICENSE)
