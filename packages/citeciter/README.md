# `@deepseek-ai/dsh-citeciter`

CiteCiter: select text in a DSH assistant reply, right-click `Citer!`, and open an explainer sidebar in the resizable right details column. Explanations run in a separate forked session that inherits the main session read-only and never writes back (see the repository `DESIGN.md`).

## Current milestone (1)

- A standard dual-face client plugin: no-op host half, browser half built by
  `tsdown` with the DSH client-bundle contract (`window.__ModuleLoader__.load` factory).
- Implemented: `assistant-step` text selection → right-click `Citer!` floating
  menu → official `details` right column (300–520px, draggable) → forked
  explainer session → `/permission read-only` → explainer prompt → streaming
  status and `MarkdownText` answer/error rendering.
- Not yet wired: Cite session management UI (D3/D7), SVG/sandboxed HTML fence
  rendering (D6), keyless snapshots.

See README.zh.md for layout, build, and local verification commands.

## Model Experience

The explainer prompt is sent as an ordinary `session.prompt` into a separate
forked child session; the main session is never written. Model output affects
only the child context; main-session KV cache is untouched.
