# `@deepseek-ai/dsh-citeciter`

CiteCiter: select text in a DSH assistant reply, right-click `Citer!`, and open an explainer sidebar in the resizable right details column. Explanations run in a separate forked session that inherits the main session read-only and never writes back (see the repository `DESIGN.md`).

## Current milestone (0)

Package skeleton and the minimum path:

- A standard dual-face client plugin: no-op host half, browser half built by
  `tsdown` with the DSH client-bundle contract (`window.__ModuleLoader__.load` factory).
- Implemented: `assistant-step` text selection → right-click `Citer!` floating
  menu → official `details` right column (300–520px, draggable) opens and shows
  the selected text plus its anchor.
- Not yet wired: forked explainer session, `/permission read-only`, explainer
  prompt, rich-media rendering, Cite session management UI.

See README.zh.md for layout, build, and local verification commands.

## Model Experience

None. This milestone renders browser UI only and sends no model request; there
is no KV-cache effect.
