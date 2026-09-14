# Learning workspace after the 0.6.0 release

The user explicitly requested publishing 0.6.0 before implementing the next experience. Version 0.6.0 is now npm latest and a public GitHub Release at https://github.com/kirkchinese/CiteCiter/releases/tag/v0.6.0, from main merge ee7c8d56e243d0445e831d29c8c5545239cea6e0. Release CI 34128268527 passed Windows and Ubuntu. The next branch is codex/learning-workspace-0.7, package 0.7.0-beta.1; it is not published to npm.

## Decisions

The accepted route is 底层逻辑 → 定性分析 → 定量分析（板书）→ 概念关联 → 总结学习卡片. Active recall is optional and off by default. The earlier design's spaced-repetition proposal is removed. Stages request teaching intent and do not assess mastery or advance automatically. Each request is a visible logged user message, recoverable after reopening.

The panel owns Explain, Board and Learning Cards, with header Topic navigation and folded secondary settings. Source geometry stays in the existing isolated adapter; no Agent Loop or host layout internals were patched for this change. Narrow reading views fold navigation and the composer to keep room for content. Reused board rendering retains its safety restrictions; readable entries and canvas are separate presentation choices over the same projection.

Cards use a private learning_cards tool rather than model JSON hidden in prose or a new database. Each successful call records one complete set. The latest valid successful set is projected from Topic messages, so a malformed, failed or unfinished call cannot erase prior usable cards. Both Host execution and persisted-data readers validate the schema. Card provenance is the owning Topic and its citation. Editing is a logged follow-up requesting a new complete set; no direct manual editor or cross-Topic collection is claimed.

Board and card tools are available in all four Topic scenarios. They only record independent Topic learning material. Workspace and source writes remain unavailable. Active recall affects presentation, never runtime scheduling. Drafts stay page-local per Topic, including late acknowledgement protection; they are not durable across refresh or application restart.

## Evidence and limits

148 behavior tests passed, including stage reconstruction, card record selection under failure, validation bounds, recall defaults, export provenance and prerelease update behavior. Separate Host/Client typechecks and bundle build passed. The real keyless DSH snapshot exercises both Observer and Exact Fork through all five stages, verifies board/cards, confirms unchanged source events and starts a second non-overlapping host to check persisted restoration. The intentional snapshot diff was reviewed before replay.

The first assembled run caught an unsupported tool DSL field: DSH 0.1.2-rc.1's author schema does not accept minItems/minLength. Bounds remain described in its supported model-visible fields and enforced with Zod at execution; the corrected assembled run passed. This distinction is added to the external development guide.

Windows Web observations include 1440 × 960 at 34% and 55%, actual main width capped at 480 CSS px at maximum proportion, and 768 × 960 and 360 × 800 switching to rows without page overflow. Card default display, recall on/reveal/off, board entries, citation append, independent Topic drafts and close/reopen draft retention were exercised. Opening a native tool event detail kept it visible alongside the learning cards; the host's conversation/trajectory switching remained functional. Extremely narrow/short windows still require scrolling; the desktop-sized two-column layout remains the primary experience.

The final packed 0.7.0-beta.1 artifact passed the same keyless suite and restart verification in a newly installed profile. Its SHA-256 is 9721f3e6a1b80b06530b6ec2446238692694a6daaffdbf5b19ef11e2e6cc1ea3. It contains the rebuilt Host/Client bundle and declaration files; no npm publish was performed for this candidate. git diff --check passed.

Native Desktop 2.0.5 was launched only after confirming no other Desktop process was running, using the isolated desktop-rc1 test home. Extended-window, compatibility and enhanced modes each displayed the restored Topic beside the source after their own restart. The native caption/window controls remained visible. The extended-window mode displayed the new card view with recall unchecked. Its embedded keyless assembled run also passed. These checks are distinct from the Web viewport tests; no exhaustive cross-product of every Desktop mode, DPI and window size is claimed.

No real paid-model learning-quality evaluation, Linux/macOS UI validation, database synchronization or manual card editing is claimed. The stable 0.6.0 release remains the daily installation recommendation during this preview.
