# Agent Note: Desktop overlay and lifecycle ownership

Status: lifecycle and selection implemented; panel layout superseded by [Reversible Host-grid compatibility adapter](2026-08-23-reversible-host-grid-compatibility-adapter.md)

Supersedes: [Current DSH line and Desktop source-shell support](2026-08-22-current-dsh-and-desktop-source-shell.md) for the current Desktop target and acceptance claim. Its rc.1/rc.2 package range and historical dataelement evidence remain valid.

## Problem

CiteCiter registered its panel in `shell.overlay` but then rewrote the overlay parent's grid columns and hid the official details handle. Desktop owns that frame, including its caption row, details column, and resize handles. Host and Client disposal also requested cancellation without waiting for all accepted asynchronous work, and the installation guide wrote only to the Web profile.

## Decision

The panel is a self-contained right overlay drawer. It changes only its own width, uses `panelWidthPercent` on viewports at least 1080 pixels wide, and uses a fixed responsive overlay below that breakpoint. It never closes details or mutates the Host frame.

DSH selection parsing depends on the declared `dsh-client-ui-conversation` package. Read Frog private markers live in a separate best-effort adapter and activate only when its complete marker set is present. Context-menu default handling occurs only after an assistant selection has been resolved.

Host and Client owners stop admission, abort cancellable work, suppress late publication, and await every accepted operation before disposal returns. All registry contributions use Cordis effects.

CiteCiter 0.4.1 targets anywhere-labs DSH Desktop 2.0.2 at tag commit `9d18856ddea4f20eb3ef8c88b0436921c6b19606`, which bundles DSH commit `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (`0.1.1-rc.2`). Packaged Desktop installs into the `desktop` profile and includes Node.js, pnpm, and DSH. The peer range remains `>=0.1.1-rc.1 <0.1.1-rc.3`.

## Alternatives considered

**Use the official details column.** This would replace Host content rather than add the persistent learning drawer users selected.

**Keep modifying the Host grid.** `shell.overlay` grants an additive floating surface, not ownership of Desktop frame geometry.

**Add a Desktop-specific adapter.** The Desktop loads standard Web Client plugins; a private adapter would add coupling without a new capability.

## Consequences

The same Client bundle serves DSH Web and Desktop. Random Desktop loopback ports can lose the browser-only last-viewed pointer because local storage is origin-scoped; Host Topics remain durable and CiteCiter falls back to the most recently updated Topic. A fixed Desktop port preserves exact last-viewed restoration.

Windows x64 and macOS universal installer evidence from the same candidate tgz is required before a Desktop GO claim. Missing either platform keeps 0.4.1 BLOCKED/NO-GO; the older dataelement Linux source-shell result is historical conditional evidence only.
