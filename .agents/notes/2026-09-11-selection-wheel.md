# Selection wheel, native preview and presentation

Final scope: 0.7.0-beta.3 on DSH 0.1.5-rc.1 / Desktop 2.0.9. The installed top-level DSH resolves native document preview and workspace-path subpackages at 0.1.5-rc.2. Their public declarations are pinned as development dependencies; the optional documentPreviews service controls registration. No host Agent Loop patch or npm publication.

## Decisions

The user requested eight slots, a configurable held trigger defaulting to right mouse, release to invoke, custom prompts/input/presentation, decoupled modules and glass visuals. Required-input modes identify themselves before selection, then show the question and model selector; direct modes use the configured default. Five learning stages and optional recall remain unchanged. Board references retain the selected stage.

actions.ts owns validated modes and defaults. wheel-gesture.ts owns browser listeners and owned reading surfaces. action-controller.ts owns wheel geometry, prompt state, duplicate suppression and retry. action-executor.ts receives explicit Topic/document callbacks. native-document.ts resolves the public file address and immutable source text. React renders snapshots and calls supplied actions; client/index.ts assembles services and public slots. host-dock.ts remains the isolated geometry exception.

No public selection-action extension exists in the inspected native preview package. CiteCiter therefore contributes a keyed alternative renderer rather than decorating built-in private DOM. It uses bytes-complete for a full UTF-8 snapshot, then the shared documentPages helper for lossless bounded display. DSH retains file opening, loading and refresh. Previewing alone does not call a model. Session identity comes from the file address, never a later active tab. Absolute addresses, binary input, partial content and excessive size are rejected.

Action captures are retained across prompt editing and retries. A weak cache reuses the document import after creation failure. Source identity is checked around asynchronous work and included in document request identity; model route participates in the client request identity. Explicit routes are validated before allocating Topic storage and are applied to the first request. Retrying an already committed creation returns that Topic rather than retargeting its current model. Mode instructions are ordinary durable user messages.

Side mode retains existing columns/rows space allocation. Floating is explicit, draggable and does not reserve a host column. Presentation changes preserve Topic drafts and clear stale row-specific folding. Native fullscreen has no public exit control in this interface: show an explicit floating action instead of changing private host state. Host modals continue to hide plugin overlays. Glass effects have reduced-motion and increased-contrast alternatives.

## Evidence and limits

178 behaviour tests, separate Host/Client type checks, tracked bundle build and a disposable real Host snapshot/restart run passed. EventTarget tests exercise installed listeners, not real desktop input. No golden was re-recorded. Final packaging and CI evidence is maintained in docs/validation/2026-09-11-wheel.md.

The in-app browser returned ERR_BLOCKED_BY_CLIENT for the local QA address; native app control is unavailable under the current tool contract. Real new UI gestures, visual scaling and Desktop/native-preview integration remain unverified. Historical beta.2 UI checks do not establish beta.3 acceptance. Keep the PR draft and the candidate unpublished; do not claim zero bugs.

Desktop's embedded native-preview and workspace-path packages are rc.1. Its shipped bundle contains the same registry, keyed slot, bytes-complete and resource props used here. This establishes inspected contract compatibility, not interactive rendering acceptance.
