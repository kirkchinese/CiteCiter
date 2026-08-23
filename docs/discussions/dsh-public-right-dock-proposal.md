# Feature request: add a public right-side companion panel to AppFrame

## Use case

I maintain [CiteCiter](https://github.com/kirkchinese/CiteCiter), a Client plugin that lets a user select part of an assistant response and investigate it in a separate panel without redirecting the source Session or Agent.

The useful wide-screen layout is:

```text
sidebar | conversation | details (when open) | companion panel
```

![CiteCiter companion panel beside the conversation](https://raw.githubusercontent.com/kirkchinese/CiteCiter/0688ea1c71999e7670ab90e075303d3cbb5460fd/assets/screenshots/citeciter-learning-dock.jpg)

The companion panel is not a replacement for `details`: tool details should remain owned by the existing `details` column and retain their own open state and width preference.

## Current limitation

CiteCiter contributes its UI through `shell.overlay`. It is the only additive frame-wide public slot today, but it is an absolutely positioned layer above AppFrame's columns. A persistent right-aligned panel therefore covers part of the conversation instead of asking the conversation to concede space.

The other available columns do not provide an additive alternative: `sidebar`, `conversation`, and `details` are single-owner slots, so contributing to one would replace shipped UI. `ctx.layout` controls the existing sidebar and details state, but has no public operation for reserving space for another panel.

Relevant source:

- [AppFrame owns the three grid tracks and renders `shell.overlay` above them](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-layout/src/client/AppFrame.tsx#L164-L198).
- [`sidebar`, `conversation`, and `details` are single-owner slots; `shell.overlay` is an additive floating slot](https://github.com/deepseek-ai/deepseek-harness/blob/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e/packages/client/ui-layout/src/client/index.ts#L33-L83).

To preserve the side-by-side product experience for now, CiteCiter uses a small reversible compatibility adapter. While the panel is open and both surfaces fit, it temporarily adds one owned attribute and two owned CSS variables to the containing AppFrame so the conversation concedes a column. On tighter frames it removes those writes and returns to overlay mode. Closing the panel or unloading the plugin removes everything the adapter owns.

The adapter does not register into `details` or call `ctx.layout.closeDetails()`. However, because AppFrame still has only three tracks, it must temporarily hide the rendered details column while the companion panel is docked. This is version-coupled and is not a layout mechanism other plugins should need to copy.

## Requested public behavior

Could `ui-layout` expose a disposable right-side companion-panel contribution owned by AppFrame?

The exact API could be a declared child slot, a `ctx.layout` registration, or a combination of the two. The minimum public surface would let a plugin contribute:

- the panel content;
- a preferred width and minimum width; and
- a registration that returns a disposer for `ctx.effect()` ownership.

AppFrame would continue to own the actual geometry and responsive policy. The intended semantics are:

- With no contribution, AppFrame behaves exactly as it does today.
- When the frame is wide enough, the conversation concedes space and the companion panel is rendered beside it.
- `sidebar` and `details` remain independent, authoritative columns; the contribution neither replaces nor closes either one.
- When all requested surfaces do not fit, AppFrame chooses a documented constrained-width fallback such as overlay or sheet mode, and restores the side-by-side layout when space returns.
- Disposing the contribution or unloading the plugin restores the preceding geometry and preferences without DOM or style residue.
- Supporting one active companion panel is sufficient for this use case; multi-panel composition is not required.

## Validation

I am happy to adapt CiteCiter to the preferred API and provide a focused prototype, screenshots, and tests covering wide and narrow frames, open and closed details, sidebar concession, resizing, plugin unload/reload, and restoration after the viewport widens.
