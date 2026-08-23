# Proposal: let Client plugins add a side-by-side panel without replacing `details`

## Summary

`ui-layout` provides `shell.overlay` for additive floating UI, but that layer is absolutely positioned and does not participate in AppFrame's three-column layout. CiteCiter needs a persistent companion panel that makes the conversation concede horizontal space when both surfaces fit, falls back to an overlay when they do not, and does not replace `details`.

The current `sidebar`, `conversation`, and `details` slots are `kind: single`, so registering into one of them replaces shipped shell UI. `ctx.layout` exposes sidebar and details transitions, but no public contribution can ask AppFrame to reserve horizontal space.

Relevant source at upstream commit [`b150a55`](https://github.com/deepseek-ai/deepseek-harness/commit/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e):

- [AppFrame owns three tracks and renders `shell.overlay` above them](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-layout/src/client/AppFrame.tsx#L164-L198).
- [`sidebar`, `conversation`, and `details` are single-owner slots, while `shell.overlay` is a floating list slot](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-layout/src/client/index.ts#L33-L83).

## Downstream reproduction

[CiteCiter](https://github.com/kirkchinese/CiteCiter) registers its panel in `shell.overlay`. Using only that public slot, the right-aligned panel covers conversation content.

The current compatibility adapter queries the containing AppFrame and adds one namespaced owner attribute plus two namespaced CSS variables while the panel is open. When a 360 px panel and a 480 px conversation fit, this produces `sidebar | conversation | CiteCiter`. When they do not fit, the adapter removes its AppFrame writes and leaves the panel as an overlay. Closing the panel or unloading the plugin removes every DOM write it owns.

The adapter does not register into `details` or call `ctx.layout.closeDetails()`. Because it can only override the private three-track layout, it temporarily obscures rendered details and hides its resize handle while preserving AppFrame's details preference. This is an unsupported, version-coupled workaround, not a recommended plugin pattern.

## Requested behavior

Could AppFrame own a disposable contribution point for one active companion panel?

The registrant would provide its content and width preference. AppFrame would remain responsible for track calculation, minimum conversation width, existing sidebar/details concession rules, resize behavior, and the constrained-width fallback. A declared child slot or a layout registration API could both satisfy the use case; I am asking first which ownership model fits the project.

Required behavior:

- With no contribution, the existing AppFrame layout is unchanged.
- Plugins never query or write AppFrame DOM, attributes, CSS variables, or grid styles.
- The conversation concedes space when the companion panel fits.
- Sidebar and details remain separately owned; their stored preferences and existing concession/restoration behavior remain authoritative.
- AppFrame chooses an overlay or sheet when the minimum widths do not fit and restores docked geometry when space returns.
- Disposal or plugin unload restores the preceding geometry without residue.
- One active contribution is sufficient; simultaneous multi-panel layout is not required by this request.

## Minimal verification

1. At a wide viewport, open a non-blank Session and open `details`; record AppFrame attributes, inline grid style, and computed column widths.
2. Register a right-aligned panel through `shell.overlay`; verify AppFrame columns are unchanged and the panel covers conversation content.
3. Enable the private compatibility adapter; verify the conversation concedes space and the stored details preference is unchanged.
4. Close and unload the plugin; verify the recorded AppFrame state and details preference are restored without residual attributes or CSS variables.
5. Repeat at 960×720, then reduce the frame until the two minimum widths no longer fit; verify the adapter switches from side-by-side to overlay and removes its AppFrame writes.
6. Widen the frame again; verify the prior sidebar/details preferences return and the companion panel docks again.

I can provide the A/B screenshots, DOM snapshots, and a focused prototype with disposal and responsive tests after the maintainers choose the preferred public API.

Related: [#2418](https://github.com/deepseek-ai/deepseek-harness/discussions/2418) identifies a different AppFrame extension gap for multi-session rendering; this request is limited to one companion panel beside the current conversation.
