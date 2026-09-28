# DSH alpha compatibility and Topic draft routing

Status: implementation and real-host acceptance in progress. This note is not a release approval.

## Contracts

Target the published DSH `0.1.7-alpha.2` artifact, upstream tag `dsh-v0.1.7-alpha.2` at `00102833dfaee1da9f48a3a8eae9d34005a75218`. Migrate the plugin's contracts; do not alter the host Agent Loop. Keep Citer-owned source directories and read-only defaults.

The wheel chooses a draft destination before presenting UI. Free question appends a real selection to the active Topic under the same source Session. Other built-in actions create a Topic. Each custom action explicitly chooses append or create. The user confirmed that no selected Topic means create a new one, not restore a recent Topic. Archived or other-source Topics are not implicit destinations.

Appending preserves the Topic model, permissions, scenario, existing question, file attachments and references. A custom action's prompt appends to the question rather than replacing it. Duplicate source/selection references are coalesced within the unsent draft; a removed reference can be added again by a new selection. Selection, destination resolution and draft preparation never submit a model request or change a running turn.

The composer plus button chooses actual files. Remove the menu that reconstructs old Topic citations or an unselected source. Conversation, tool, document and board references originate from actual selection actions and remain removable before manual submission. Document references added to an existing Topic must be readable only after their addresses are manually submitted.

Controllers own destination resolution and draft events. Pure reference helpers own reference identities and merging. React renders the result and focuses the composer; it does not infer destinations or discover host services.

## Evidence and limits

The previous executor unconditionally invoked create/createFromDocument. The composer plus menu regenerated topicDraftReferences from Topic metadata after references were removed. These are separate paths and both require correction.

The main Web profile now runs a local dsh-codex-connect 0.1.0-alpha.4.41.citer.1 patch. It migrates settingsScope/installSection to configForms/settings.configure and adapts serialized transform schemas through the existing decoder and shared describe mirror. Writes retain the native mutation queue and revision checks. Real Codex text and image-input turns succeeded; image generation reached the real tool but failed with ECONNRESET. Diagnostic instrumentation was removed and installed package hashes match the final patch. See docs/compatibility/dsh-codex-connect-alpha.md.

The host layout adapter now recognizes both alpha shrinkable details tracks and the 400 px center minimum. Wide, narrow page navigation, details fullscreen, maximum proportion and floating-to-docked drag were visually checked. Desktop remains a separate unverified target.

Board capture is now an independent controller and shell overlay worker. A broker job pins the exact Topic and board snapshot; the worker renders that revision without navigating or opening the panel. Actual vision-model capture succeeded with the Citer panel closed. Keep a connected page; sandboxed HTML is excluded. Strengthened route-OFF wording prevents teaching-todo completion from being inferred from old plans; a subsequent vision turn used only blackboard_view.

Archived Topics restore on newly admitted user inbox insertions, including queued or steered input. A pure archive helper distinguishes admission from later claim/model/tool events. The scoped listener serializes metadata updates with archive/delete; snapshot reconciliation reads the durable log after a restart. A newer explicit archive wins over an older admission. Client reconciliation switches to the active list when the selected archived Topic becomes active. Legacy private-runtime follow-ups restore only after commit. No source Session or host Agent Loop is changed.

Host and Client typechecks and a full prepack passed. Earlier transient Windows writes during bundle normalization required a retry; do not misreport those failed attempts. The 0.9.0-alpha.1 candidate is local only: no npm publication, GitHub release, push or commit was performed.

Real archive regression passed: an archived Topic became active after manual submission; archiving during generation stayed archived after the answer completed. Offline submission retained the draft and archive state. Host restart preserved archive state but reloaded the page and discarded the draft; the user has been asked whether drafts should persist locally. Busy Ctrl+Enter was recorded as next-step and answered; stop interrupted a real request and subsequent submission with a saved Low reasoning setting succeeded.

## Native-details navigation

The user explicitly chose native file details when all panes cannot fit. The isolated layout adapter now releases its owned grid styles and suspends the panel when details open or the viewport shrinks. Closing details restores the same mounted Topic and composer. A monotonically increasing overlay activation records explicit Citer navigation; file-selection actions and the return launcher can intentionally enter the compact Citer page. Once both panes fit, later shrinking prioritizes details again. Source panes regain accessibility when the compact page suspends. No host setting, document, Agent Loop or saved width is rewritten.

Real UI checks passed at 1440×900 (details priority and draft restoration), 2160×1050 (all panes), and 720×900 (compact page/back). Native README selection entered the composer without automatic submission. The actual DeepSeek vision model subsequently searched/read the saved document and answered with the correct wheel rules and video URL. Final viewport override was reset.

The live attachment endpoint returned the exact uploaded README bytes and rejected another Topic without a reference. A successful browser download landing is still unverified. Native Desktop, image generation, drag/paste combinations, and any newly chosen cross-reload draft persistence remain separate acceptance limits. Automatic approval blocked both scoped old-home deletion and a single-file cleanup attempt; old ignored development paths remain, listed in the validation record. Do not treat static checks or historic 0.8 acceptance as current alpha passes.
