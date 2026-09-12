# Windows functional acceptance and summary self-check

## Decisions

The user confirmed that question forms retain the question and model across blur and resize until explicitly closed or the source changes. Gesture cancellation now dismisses only the wheel; Escape and explicit close still cancel the draft. A pending form rejects another gesture rather than silently replacing its source.

The public companion façade must forward every typed create argument. The internal methods already accepted first-turn model routes and captured source identity, but wrappers forwarded only the early positional parameters. Three regression cases cover conversation routing, document routing and stale document source rejection.

Native full-screen document preview sits above the shell.overlay stacking context. Raising a child z-index cannot escape that parent. Plugin-owned floating views use React portals while the public slot owns mounting and disposal. Docked panels remain inline so host-dock keeps its explicit frame adapter. No shared host overlay styles or Agent Loop were changed; host modal hiding remains in plugin CSS. React DOM is a development dependency and a host platform external, not another bundled React runtime.

Reader/native learning surfaces display literal text, while conversation selections display rendered Markdown. These are different protocols. Document evidence now uses exact raw matching with literal prefix/suffix scoring; missing or ambiguous matches are rejected. Rendering normalization remains specific to conversation evidence. Tests cover headings, links, code fences, punctuation-sensitive duplicates and a full-document command round trip.

The user chose check-and-correct before summary cards. The visible summary request and logged shared tutor contract require checking conditions, calculations and contradictions; corrections must reach examples and reference answers, and unresolved claims must be marked or omitted. The tool documents that it checks structure, not truth. Existing custom prompts are not rewritten; newly assembled tutors receive the shared contract. No extra application-level model call is introduced.

## Evidence and limits

See [the acceptance record](../../docs/validation/2026-09-12-acceptance.md) for exact automated, UI and real-model results. The new summary request intentionally changes two user messages in the assembled golden; no assistant, board or card outputs were re-recorded. Real-model self-check still missed a factual error and generated inaccurate source locators. This remains a quality limitation, not a successful factual verification claim.

Native automation uses the dedicated Windows skill API. Stale window handles require fresh window discovery; a closed test window was reopened by the user. Browser read-only DOM geometry and hit tests supplemented screenshots to distinguish mounted but occluded UI from successful interaction. No credentials, raw sessions, screenshots, temporary fixtures or archives are committed.

Additional UI checks covered the 55% proportion with native details, preserving 480 CSS pixels for the source, and a custom seventh action surviving reload and executing with the configured default model and floating presentation. Dark mode revealed hard-coded blue header labels with insufficient contrast; tinting the host's primary label color preserves legibility in both themes. Desktop compatibility, extended and enhanced modes each restored the Topic after restart; this is not an exhaustive DPI or theme matrix.
