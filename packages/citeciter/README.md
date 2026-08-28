# `@kirkchinese/dsh-citeciter`

Investigate any line in a DSH response—without stopping the Agent or changing the source Session. CiteCiter provides verifiable, source-bound, read-only side investigations for interactive DSH.

![Select a DSH response and continue investigating in a private CiteCiter Topic](https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/demo/citeciter-0.4.0.gif)

*Select, right-click, and investigate beside the source while the main Agent keeps working.*

[简体中文](README.zh.md) · [GitHub](https://github.com/kirkchinese/CiteCiter) · [Issues](https://github.com/kirkchinese/CiteCiter/issues)

## Highlights

- **Exact source binding.** CiteCiter rechecks the visible selection against the committed response before creating a Topic.
- **No need to wait.** A committed intermediate model call can be investigated while the surrounding Agent turn continues, including its reasoning or a selection spanning reasoning and answer text.
- **Durable investigations.** Private Topics support natural follow-up questions and reopen after a refresh or restart.
- **Evidence with no write access.** CiteCiter can inspect committed source events and search or read project files, but cannot change the source Session or workspace.
- **Inspectable work.** Questions, answers, source reads, and project-file checks remain together in the investigation panel.
- **Side-by-side workflow.** The conversation concedes space whenever the panel and a usable conversation fit; tighter layouts fall back to an overlay.

## Use

1. Select answer or expanded reasoning text inside a committed assistant model call. The surrounding Agent turn may still be running.
2. Right-click the selection, enter your first question, and choose `Citer!`.
3. CiteCiter creates a new Topic in the investigation panel.
4. Continue asking questions there, or reopen an earlier Topic from CiteCiter's Topic rail.
5. Change the Topic model, reasoning effort, title, archive state, or panel width without changing the source Session.

## Install v0.4.3

CiteCiter 0.4.3 requires Node.js `^22.19.0 || >=24.0.0` and DSH `>=0.1.1-rc.1 <0.1.1-rc.3`.

For DSH Web:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.3
```

Restart DSH Web and refresh the page. Packaged Desktop adaptation is deferred; CiteCiter 0.4.3 does not provide a supported Desktop installation path.

## Context modes

Observer is the default. It creates an independent Topic and reads committed source evidence on demand, including while the source turn is still running.

Exact Fork is an advanced mode for a source turn that has already ended. `exact-when-available` uses Exact Fork when a stable boundary exists and otherwise falls back to Observer.

## Compatibility and verification

| Host | CiteCiter version | Status |
|---|---|---|
| DSH Web `0.1.1-rc.2` | `0.4.3` | Linux package, regression tests, and real-browser selection checks passed; real-provider acceptance was not run |
| [DSH Desktop 2.0.2](https://github.com/anywhere-labs/deepseek-harness-desktop) with bundled DSH `0.1.1-rc.2` | Future target | Adaptation and native acceptance are deferred; no packaged-Desktop compatibility claim |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) development shell with DSH `0.1.1-rc.1` | `0.4.0` only | Historical conditional Linux source-shell evidence |
| DSH Web `0.1.0-rc.7` | `0.3.2` | Previous stable line |
| DSH TUI | — | Not supported yet |

The demo uses a deterministic fixture to show the workflow; it is not real-provider or packaged-Desktop acceptance evidence.

## Upgrade from an earlier version

To install or upgrade v0.4.3 in Web:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.4.3
dsh plugin --profile web list --depth 0
```

Packaged Desktop adaptation is deferred and is not part of the supported 0.4.3 upgrade path.

Upgrading from v0.3 does not migrate or rewrite existing Topics, settings, or source Sessions. Users remaining on DSH `0.1.0-rc.7` should keep CiteCiter 0.3.2.

## Limitations

- A selection must include at least one committed assistant model call. User-only ranges, tool-only ranges, still-streaming fragments, and the generated reasoning disclosure header cannot anchor a Citation.
- Renderer-generated KaTeX layout and footnote numbers cannot be cited directly because they lack stable source coordinates.
- Exact Fork cannot start from an open source turn.
- Source-file access depends on the running DSH filesystem service and remains read-only.
- Read Frog translated selections are a best-effort compatibility path on DSH rc.1/rc.2 and activate only when its complete private marker set is present; ordinary DSH selection does not depend on Read Frog.
- DSH does not yet expose a public additive right-dock contribution point. CiteCiter therefore uses a reversible private AppFrame grid adapter whenever the panel and conversation fit; it preserves the layout's details preference but temporarily hides that column while the investigation panel is open, and it must be retested for every supported DSH release.
- Topics are Host-durable. When Desktop restarts on a different loopback port, CiteCiter falls back to the most recently updated Topic because browser local storage is origin-scoped; configure a fixed Desktop port to restore the exact last-viewed Topic.
- CiteCiter 0.4.3 makes no packaged-Desktop compatibility claim; native Windows and macOS adaptation continues separately.
- There is currently no TUI interaction adapter.
- DSH is prerelease software; later DSH API versions may require a CiteCiter update.

## Community

Questions, workflow ideas, and compatibility reports are welcome in the DSH-Citeciter QQ group (`1108040435`).

<p align="center">
  <img src="https://raw.githubusercontent.com/kirkchinese/CiteCiter/main/assets/community/qq-group.jpg" width="360" alt="QR code for the DSH-Citeciter QQ group 1108040435">
</p>

## Contributing

Issues and pull requests are welcome. Before submitting code, read the [contribution guide](https://github.com/kirkchinese/CiteCiter/blob/main/CONTRIBUTING.md).

## License

MIT © CiteCiter contributors
