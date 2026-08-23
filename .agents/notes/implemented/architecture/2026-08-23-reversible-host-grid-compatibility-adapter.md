# Agent Note: Reversible Host-grid compatibility adapter

Status: implemented

Supersedes: the panel-layout decision in [Desktop overlay and lifecycle ownership](2026-08-23-desktop-overlay-and-lifecycle.md). Its lifecycle, selection, Desktop target, and acceptance decisions remain current.

## Problem

The public `shell.overlay` slot is a floating layer outside the AppFrame column solver. An overlay-only CiteCiter panel covers the conversation instead of preserving the established side-by-side learning workflow. DSH rc.1 and rc.2 expose no additive public right-dock seat.

## Decision

CiteCiter continues to register its panel in `shell.overlay`. When the containing AppFrame can fit the 360-pixel minimum CiteCiter width beside a 480-pixel conversation, a version-pinned compatibility adapter adds one namespaced owner attribute and two namespaced CSS variables to that frame and replaces the visible details track with the CiteCiter width. The adapter does not register in the `details` slot or call `ctx.layout.closeDetails()`.

When those two minimum widths do not fit, the adapter removes its Host writes and renders the panel as an overlay of at most 720 pixels. Each mounted adapter has a unique owner token, so cleanup cannot remove a successor's contribution. Close, unload, and HMR cleanup remove every attribute and variable owned by that instance.

## Consequences

The Host details preference remains unchanged, but its column and resize handle are hidden while the wide dock is active and return when the dock closes. This implementation depends on private AppFrame DOM and CSS, is not a DSH public integration pattern, and requires browser verification for every supported DSH release and Desktop build.

The overlay-only candidate remains useful as the public-API A/B baseline but no longer represents the current candidate. Package and browser evidence must be regenerated after this decision. An upstream Discussion requests an AppFrame-owned, reversible right-dock contribution point; when that public extension exists, CiteCiter should delete this adapter.

## Alternatives considered

**Keep the overlay-only panel.** This stays within the public surface but obscures the source conversation on wide layouts.

**Use the official details slot.** That replaces Host details content and does not provide an additive companion surface.

**Create a fourth private grid track.** The current details resize handle is positioned for the three-track solver, so a fourth track would leave Host geometry inconsistent.
