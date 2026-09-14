# Windows acceptance and latest-host migration

The user requested remote review, local installation, functional acceptance and concise illustrated technical READMEs. Work began at codex/learning-workspace-0.7 commit 470cb74f4e002f33c634b080bb1ebdd0127d107c. The initial DSH 0.1.2-rc.1 / Desktop 2.0.5 pass is recorded separately. The later instruction “换成最新版” replaces that baseline with npm latest DSH 0.1.5-rc.1 and community Desktop 2.0.9. The candidate is 0.7.0-beta.2. Push is authorized; npm publication, tags and public releases are not.

## Product decisions

User-confirmed behavior: retain complete documents with pagination; close the Reader and show the learning panel after successful creation, preserving the selection and question on failure; allow Reading Topics read-only source-project tools when allowSourceFiles is enabled. The five-stage route remains underlying logic, qualitative analysis, quantitative analysis with a board, concept connections, and summary cards. Active recall is optional and off by default. No spaced repetition is introduced.

During the native board-citation check, the selected summary stage remained attached to the filled draft. The user explicitly confirmed retaining the stage and explaining citations through that stage. No behavioral change is required; all READMEs now state this rule.

## Reader and layout decisions

Document reads validate persisted metadata and return a zero-based page with a 500 KiB UTF-8 budget. Page boundaries retain code points and all source text. Controller generations discard stale results; request guards prevent duplicate creation. The tracked promise is the one returned by finally, avoiding detached rejections. Large Markdown mappings append array elements without argument spreading; 180,000-character regressions reproduce the former stack overflow.

Scoped public slots own UI contributions. The existing host-dock exception remains isolated because preserving visible source content at large proportions is required. Its 0.1.5 adapter follows the new rightbar handle and fullscreen attribute. Fullscreen releases owned styles and restores them on exit; unknown layouts get no fullscreen fallback. Host modals hide plugin surfaces without changing host z-index. Native board citations reveal the explanation composer.

## Latest API decisions

Before migration, the pinned upstream AGENTS, architecture and installed package declarations were inspected against Desktop 2.0.9 upstream commit 183f08e9c6dde7e36cd2318eaee70b0da08fb35e. The external guide at E:/project/DSH-Plugin-Development-Guide/11-dsh-0.1.5-desktop-2.0.9.md records this preflight. The community Electron shell and upstream first-party desktop are distinct products.

Agent setup now receives Agent explicitly. One process-local stream projection per scoped Agent listens to agent/assistant-stream and is released with that scope. Snapshot rows detach from its mutable assembler; durable assistant/attempt streams retain failed output without inserting model-visible messages. Source and Topic logs remain separate.

Read-only Session handles replace inspect/readFrom and always close. DSH's catalog owns v0-to-v3 migration; CiteCiter does not rewrite physical seedLength or transform Session events. Old numeric fork boundaries cannot safely slice migrated logs, so Exact Fork reads its restored inherited prefix, and title projection uses that same logical cut. Exact title caches hydrate once after a cold read. Historical citation text remains available; prompt guidance treats old sequence addresses as capture-time references rather than authoritative current positions.

DSH exposes no public deletion/location method. A bounded filesystem adapter enumerates two levels only within the exclusively owned Topic Session root, requires a generated citeciter identity, rejects linked Session directories, and deletes only canonical JSONL generations plus the retired lock file. It runs after Agent disposal and retains deletion tombstones on cleanup failure. The existing containment checks protect source/outside files. A regression verifies older generations cannot survive a completed deletion.

The published dsh-client-store package imports zustand and immer while declaring them only as upstream devDependencies. A version-specific pnpm package extension supplies them for this repository's Node tests; host Client modules remain supplied by DSH. The smoke runner validates exact host identity/version and accepts CITECITER_DSH_BIN for an isolated installation.

## Evidence and limits

165 behavior tests pass, with separate Host/Client typechecks and rebuilt tracked bundles. Real keyless tests exercise Observer and Exact Fork, five stages, board/card records, source-log invariance, model configuration, management, questions, long-document citations, live output, retained text on stop/failure and restart follow-ups. Tarballs are installed in clean profiles. See the latest acceptance record for the final installation, legacy data and UI results.

Root/package Chinese and English READMEs share behavior tables and two purpose-made SVG diagrams, explicitly labelled as diagrams. Historical beta.1 release notes are preserved. Temporary homes, logs, screenshots, credentials and tarballs remain ignored. Native test actions affect only the disposable Desktop profile; another Web process is not stopped.

Browser automation failed to load its request-header policy. Native automation intermittently reported stale observations and user input; only observed successful actions count. Deterministic models validate program behavior and persistence, not teaching quality. No claim is made of zero bugs or exhaustive Linux/macOS/DPI coverage.

Native Desktop 2.0.9 checks now include long-document second-page selection and successful auto-close, panel close/reopen, board citation with focused composer, actual Markdown download, optional recall, 120%/144% zoom and all three presentation modes at startup. The file-open dialog appears, but its coordinate targeting failed twice, so native import is not counted as complete. The delayed save dialog was subsequently observed and its saved output verified, not treated as an export defect. Both default profiles have the candidate installed; the test home remains separate from daily data.
