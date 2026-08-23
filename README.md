<h1 align="center">CiteCiter</h1>

<p align="center"><strong>Investigate any line in a DSH response—without interrupting the work that produced it.</strong></p>

<p align="center">Verifiable, source-bound, read-only side investigations for interactive DeepSeek Harness.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kirkchinese/dsh-citeciter"><img src="https://img.shields.io/npm/v/@kirkchinese/dsh-citeciter" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="MIT license"></a>
</p>

<p align="center">
  <a href="README.zh.md">简体中文</a> ·
  <a href="https://www.npmjs.com/package/@kirkchinese/dsh-citeciter">npm</a> ·
  <a href="https://github.com/kirkchinese/CiteCiter/issues">Issues</a>
</p>

<p align="center">
  <img src="assets/demo/citeciter-0.4.0.gif" width="100%" alt="Select a DSH response and continue asking in a private CiteCiter Topic">
</p>

<p align="center"><sub>Select, right-click, and ask beside the source while the main Agent keeps working.</sub></p>

CiteCiter is for the moments when a long-running Agent says something worth pausing over, but the task itself should not pause. It opens a separate investigation beside the conversation, keeps that investigation tied to the exact source text, and leaves the source Session and workspace unchanged.

## Why CiteCiter

- **Cite the exact words.** The selected excerpt is checked against the committed assistant response before a Topic is created.
- **Ask before the Agent finishes.** A committed model response is enough; the surrounding Agent turn may still be running.
- **Keep the investigation alive.** Each Topic supports natural follow-up questions and can be reopened after a refresh or restart.
- **Check the evidence.** CiteCiter can inspect committed source-Session events and search or read project files through read-only tools.
- **Protect the original task.** The investigation runs in its own read-only Session. It cannot write to the source Session or source workspace.

## Who it is for

CiteCiter is especially useful when you:

- run long, interactive DSH tasks and want to clarify one claim without diverting the main Agent;
- review AI-assisted code and need to test an explanation against the Session record or repository;
- learn an unfamiliar codebase and want a persistent thread for “why does this work?” questions.

It is not intended for every DSH workflow. TUI, headless, and fully automated runs do not currently have a CiteCiter interaction adapter.

## Install after the 0.4.1 release

CiteCiter 0.4.1 is currently a source candidate and has not cleared release acceptance. It supports Node.js `^22.19.0 || >=24.0.0` and DSH `>=0.1.1-rc.1 <0.1.1-rc.3`.

For DSH Web:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.1
```

Restart DSH Web and refresh the page. Packaged Desktop adaptation is deferred; CiteCiter 0.4.1 does not provide a supported Desktop installation path.

## Use

1. Select text inside a committed assistant response. The surrounding Agent turn may still be running.
2. Right-click the selection, enter the first question, and choose `Citer!`.
3. Continue the discussion in the panel beside the source conversation.
4. Reopen, rename, archive, or resume earlier Topics from the Topic rail.

Each Topic keeps its own model, reasoning effort, title, messages, and source binding. Changing any of them does not change the source Session.

## Evidence without write access

| Surface | What CiteCiter can do | What it cannot do |
|---|---|---|
| Selected response | Recheck and preserve the exact committed source range | Anchor a still-streaming fragment |
| Source Session | Read bounded committed events, including later events in the default mode | Append, rewrite, or steer the main Session |
| Project workspace | Discover, search, and read files when the DSH filesystem service is available | Create, edit, or delete project files |
| Topic | Keep a durable, multi-turn investigation under `$DSH_HOME/citeciter/` | Appear as or modify an ordinary source Session |

## See the investigation workspace

<p align="center">
  <img src="assets/screenshots/citeciter-learning-dock.jpg" width="100%" alt="CiteCiter panel beside a DSH programming conversation">
</p>

<p align="center"><sub>The panel keeps the quote, questions, answers, source reads, and project-file checks together. This screenshot is a deterministic fixture, not packaged-Desktop or real-provider evidence.</sub></p>

<p align="center">
  <img src="assets/screenshots/citeciter-settings.png" width="720" alt="CiteCiter settings inside the DSH settings dialog">
</p>

## Context modes

The default **Observer** mode reads committed source evidence on demand. It can start from a completed model response while the wider Agent turn continues, and it can see later committed events.

**Exact Fork** is an advanced mode for a source turn that has already ended. `exact-when-available` uses that fixed boundary when possible and otherwise falls back to Observer. Existing Topic files and settings keep their current format in 0.4.1.

## Compatibility and verification

| Host | CiteCiter version | Current evidence |
|---|---|---|
| DSH Web `0.1.1-rc.2` | `0.4.1` candidate | Linux package, CI, upgrade, and assembled keyless browser checks passed; real-provider acceptance was not run |
| [DSH Desktop 2.0.2](https://github.com/anywhere-labs/deepseek-harness-desktop) with bundled DSH `0.1.1-rc.2` | Future target | Adaptation and native acceptance are deferred; this candidate makes no packaged-Desktop compatibility claim |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) development shell with DSH `0.1.1-rc.1` | `0.4.0` only | Historical, conditional Linux source-shell evidence |
| DSH Web `0.1.0-rc.7` | `0.3.2` | Previous stable line |

The demo and screenshots use a deterministic fixture to show the workflow; they are not real-provider or packaged-Desktop acceptance evidence.

## Upgrade from an earlier version

After v0.4.1 is published, upgrade the profile you use and verify the resolved version. Web uses:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.1
dsh plugin --profile web list --depth 0
```

Packaged Desktop adaptation is deferred and is not part of the supported 0.4.1 upgrade path. Upgrading from v0.3 does not migrate or rewrite existing Topics, settings, or source Sessions. Users remaining on DSH `0.1.0-rc.7` should keep CiteCiter 0.3.2.

## Known limitations

- A selection must contain at least one committed assistant response. User-only ranges, tool-only ranges, and still-streaming fragments cannot anchor a citation.
- Renderer-generated KaTeX layout and footnote numbers do not have stable source coordinates and cannot be cited directly.
- Source-file access depends on the running DSH filesystem service and remains read-only.
- Read Frog translated selections are a best-effort compatibility path on DSH rc.1/rc.2; ordinary DSH selections do not depend on it.
- DSH does not yet expose a public additive right-dock contribution point. CiteCiter therefore uses a reversible, version-pinned AppFrame compatibility adapter whenever the frame can fit both the learning dock and a usable conversation; it temporarily hides the visible details column and otherwise falls back to an overlay.
- On Desktop, changing the loopback port changes the browser origin. CiteCiter then reopens the most recently updated Topic; use a fixed port to restore the exact last-viewed Topic.
- DSH is prerelease software, so later API versions may require a CiteCiter update.

## Community

Questions, workflow ideas, and compatibility reports are welcome in the DSH-Citeciter QQ group (`1108040435`).

<p align="center">
  <img src="assets/community/qq-group.jpg" width="360" alt="QR code for the DSH-Citeciter QQ group 1108040435">
</p>

## Contributing

Issues and pull requests are welcome. Before submitting code, read the [contribution guide](CONTRIBUTING.md). The current product boundaries and staged roadmap are documented in the [product strategy](docs/product-strategy.zh.md).

## License

[MIT](LICENSE) © CiteCiter contributors
