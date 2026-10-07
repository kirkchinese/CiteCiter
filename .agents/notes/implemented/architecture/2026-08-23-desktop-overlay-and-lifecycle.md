# Agent Note: Overlay and lifecycle ownership

Date: 2026-08-23. The layout choice was subsequently superseded by [the reversible grid adapter](2026-08-23-reversible-host-grid-compatibility-adapter.md); the lifecycle obligations remain useful.

Registering in shell.overlay grants an additive surface, not ownership of the parent frame or details handle. The initial design therefore kept layout within the public overlay. A later isolated compatibility exception is documented separately and must not expand into unrelated host internals.

Disposal must stop accepting new work, request cancellation, wait for already accepted asynchronous work, and then release listeners and resources. Requesting cancellation without draining can lose final events or leave callbacks targeting disposed state.

Selection contributions should declare their public dependencies and remain scoped to the owner. Native preview is optional; its absence must not prevent the rest of the plugin from loading. These choices do not modify the host Agent Loop or stored Session formats.

Browser-only last-viewed pointers are origin-scoped. Changing the loopback port can lose that pointer even while Host Topics remain durable. Distinguish client navigation state from persisted conversation ownership when diagnosing restoration.
