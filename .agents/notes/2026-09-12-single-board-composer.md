# Single blackboard and compact Topic composer

## Decisions

The user identified the in-panel Board and main-area Blackboard as duplicate views of the same projection. CitePanel now offers Explain and Learning Cards only. The public conversation.view Blackboard remains the sole board surface; its data, runtime subscription and citation bus are unchanged. Quantitative stage selection keeps the explanation visible and still requires submission. Board citations append to the Topic draft and retain its selected stage.

The supplied host-composer reference places reasoning on the left, model on the right and a circular upward send button beside it. Topic rename, archive and delete move to a header overflow entry and a separate settings dialog. Model identities remain qualified by provider; unknown routes remain visible. Sending waits for route or reasoning saves, while stopping an active answer remains available.

TopicComposer, TopicModelControls and TopicSettingsDialog each own a view and CSS module. They receive typed data and business callbacks, without Cordis discovery, subscriptions or remote calls. CitePanel owns workspace state and composition; the controller remains responsible for persistence. The shared dialog focus handling also covers the settings dialog. No runtime, prompt, source-log or host-layout changes were needed.

## Evidence and limits

All 184 existing behavior tests, Host/Client typecheck and build passed. A packed tarball passed the real keyless DSH Observer, Exact Fork, five-stage, board, card and restart regression in a fresh temporary home. No golden output changed. This UI revision adds no implementation-mirroring unit tests.

Actual Web tests covered model and reasoning changes, quantitative generation, one main-area board, quotation preserving stage, rename, archive/restore, disabled destructive confirmation without an ID, settings close, and reopening the panel by quoting the board. The 900 × 700 viewport kept model controls inside the side panel; 650 × 700 used rows with controls and card-mode expansion available. The existing 55% setting and native details were checked at 1600 × 900; the host adapter used rows when its details pane left insufficient width. Temporary viewport overrides were cleared.

The open isolated Desktop window displayed the same modules; native interaction changed Fixture to Fixture Alt and opened/closed the settings dialog. The model dropdown remained keyboard-operable. Activation and a fresh capture resolved an initially occluded screenshot; no stale screenshot coordinates were used. This change was not rechecked across every Desktop mode, DPI or theme combination. The prior real-model accuracy limitations still apply; this revision does not change model output instructions.

Root/package Chinese and English READMEs, the workspace SVG diagram and release document now describe a single main-area board and the new composer controls. Installation artifacts, UI fixtures and screenshots remain untracked. Publishing is not part of this change.
