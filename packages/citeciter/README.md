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
- **Presenter Topics.** A read-only teacher can build a durable formula, diagram, table, or animation board through atomic tool commits while it explains.
- **Side-by-side workflow.** The conversation concedes space whenever the panel and a usable conversation fit; tighter layouts fall back to an overlay.
- **Web update notices.** CiteCiter checks npm's stable version and offers a copyable upgrade command without granting the browser package-management access.

## Use

1. Select answer or reasoning inside a committed assistant model call. When reasoning is collapsed, begin the selection on its disclosure row; the row represents the complete model call. The surrounding Agent turn may still be running.
2. Right-click the selection, enter your first question, and choose `开始提问` or `开始讲解`.
3. CiteCiter creates a new Topic in the investigation panel.
4. Continue asking questions there, or reopen an earlier Topic from CiteCiter's Topic rail.
5. Change the Topic model, reasoning effort, title, archive state, or panel width without changing the source Session.

## Install v0.5.0

CiteCiter 0.5.0 requires Node.js `^22.19.0 || >=24.0.0` and DSH `>=0.1.1-rc.1 <0.1.1-rc.3`.

For DSH Web:

```sh
dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.5.0
dsh plugin --profile web list --depth 0
```

Confirm that the list shows `@kirkchinese/dsh-citeciter@0.5.0`, then restart DSH Web and refresh the page.

CiteCiter 0.5.0 is Web-only.
Upgrading from v0.3 does not migrate or rewrite existing Topics, settings, or source Sessions.
Users remaining on DSH `0.1.0-rc.7` should keep CiteCiter 0.3.2.

## Context modes

Observer is the default. It creates an independent Topic and reads committed source evidence on demand, including while the source turn is still running.

Exact Fork is an advanced mode for a source turn that has already ended. `exact-when-available` uses Exact Fork when a stable boundary exists and otherwise falls back to Observer.

## Presenter board

Presenter Topics use the standard Agent loop plus a scoped `blackboard_apply` tool. A board batch becomes visible only after its paired tool result succeeds; a failed or interrupted batch leaves the previous board intact. Refresh and restart project the final board from the private Topic Session rather than storing a second mutable copy.

## Web update notices

The Web client checks npm's `latest` stable version without blocking startup. A newer version appears in a persistent upper-right card with `更新`, `下次一定`, and `不再提示`: the first action copies the standard Web Profile install command, the second hides that version for the current tab session, and the third disables future checks until the CiteCiter settings page enables them again. CiteCiter never runs the install command; execute it in a terminal and restart DSH Web.

The first release containing the checker still needs one manual upgrade because an older installed build cannot run code it does not contain. Custom Web Profiles must replace `web` in the copied command. Check the newer release's DSH requirement before installing; the notice compares package versions and does not assert host compatibility. Desktop updates are outside this feature.

## Host developer API

0.5.0 provides the v1 Host service `ctx.citeciterRuntime` (`create`, `ask`, `get`, `list`, and `delete`) and the `citeciter/topic-created`, `citeciter/topic-updated`, and `citeciter/topic-deleted` events. Browser entry registration, presets, and a separate client face remain planned for M4/M5, so frontend extension APIs are not stable yet.

## Supported hosts

| Host | CiteCiter version | Notes |
|---|---|---|
| DSH Web `0.1.1-rc.1` and `0.1.1-rc.2` | `0.5.0` | Fresh-profile Linux package, assembled browser smokes, and a real DeepSeek provider run passed |
| [DSH Desktop 2.0.2](https://github.com/anywhere-labs/deepseek-harness-desktop) with bundled DSH `0.1.1-rc.2` | Future target | Packaged Desktop installers have not been accepted yet |
| [dataelement DSH Desktop](https://github.com/dataelement/dsh-desktop) development shell with DSH `0.1.1-rc.1` | `0.4.0` only | Historical Linux source-shell record |
| DSH Web `0.1.0-rc.7` | `0.3.2` | Previous stable line |
| DSH TUI | — | Not supported yet |

The demo is only a workflow illustration. It is not packaged-Desktop acceptance evidence.

## Limitations

- A selection must include at least one committed assistant model call. User-only ranges, tool-only ranges, and still-streaming fragments cannot anchor a Citation. A committed model call's reasoning disclosure row may represent that complete call.
- Renderer-generated KaTeX layout and footnote numbers cannot be cited directly because they lack stable source coordinates.
- Exact Fork cannot start from an open source turn.
- Source-file access depends on the running DSH filesystem service and remains read-only.
- Read Frog translated selections are only a compatibility fallback for DSH rc.1/rc.2 and only activate when the full private marker set is present.
- DSH still has no public right-dock extension point. When side-by-side layout fits, CiteCiter temporarily adjusts the layout; every new DSH version needs that path retested.
- Topics are Host-durable. When Desktop restarts on a different loopback port, CiteCiter falls back to the most recently updated Topic because browser local storage is origin-scoped; configure a fixed Desktop port to restore the exact last-viewed Topic.
- Permanent Topic deletion is owner maintenance over CiteCiter's fixed private JSONL root because DSH rc.2 has no Session deletion API. One active CiteCiter process must own a DSH home; sharing that home between live processes is unsupported.
- CiteCiter 0.5.0 is Web-only; packaged Desktop support is still pending.
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
