# CiteCiter durable Thread lifecycle

Status: implemented by the v0.2 Host+Client architecture. The earlier one-shot, Client-only explainer lifecycle is superseded by this document and by ADR 0001.

## Ownership and identity

CiteCiter is one external Cordis package with two faces:

- The Host face provides the agent-scoped `citeciter` Typert Remote service, registers the durable `citeciter` session projection, and installs Tutor, Citation Context, and tool-isolation effects on only the matching child Agent.
- The Client face captures selections, orchestrates supported session/workspace operations, renders the `details` slot, and reconstructs Thread summaries from projection values.

A Citation record is immutable. Its identity combines the source session, the finalized assistant node's real `anchorSeq`, and a SHA-256 digest over canonical selection evidence: anchor key/seq, UTF-16 start/end offsets, exact selected text, and bounded prefix/suffix. A different range in the same answer is a different Citation. Timestamps are not identity.

## Creation order (fail closed)

The browser accepts a trimmed selection only when the complete range stays inside one `assistant-step` flow. At question time it resolves `anchorKey` through `parentBinding.session.getSnapshot().chat.nodes.get(anchorKey)`, requires a finalized assistant payload in a closed turn, and takes `sourceNode.anchorSeq`; key text is never parsed as an event sequence.

For a new Citation, the serialized Client operation is:

1. `sessions.fork({ sessionId: sourceSessionId, atSeq: sourceNode.anchorSeq })`.
2. Resolve the concrete child binding and call its `session.open()`; never call `sessions.open(id)`, which would change the main GUI selection.
3. Run `session.command('/permission read-only')`.
4. Require both admission `ok` and `value.matched`; failure sends no model-visible question.
5. Call Agent-scoped `remote.citeciter.prepareThread(childId, citation)`.
6. Host waits for that child-owned permission command's durable `command/done: success` and intervening `permission/preset: read-only`, and requires the latest child-owned preset plus sandbox mode to remain `read-only`; an error, downgrade, missing event, or timeout fails closed.
7. Host validates lineage, `seedLength`, matching inherited `step/end`/`turn/end`, exact UTF-16 span, canonical fingerprint, and immutable per-Agent identity, then installs scope.
8. Send the exact normalized question as `session.prompt([{ type: 'text', text: question }], 'queue')`.

The Client does not wrap the question in role or Citation prose. Repeating a known Citation opens its projected child rather than forking again. Follow-ups repeat the read-only and Host readiness checks, then become independent user turns in the same child.

## Four model-input layers

The child model input keeps separate authority and persistence layers:

1. **Scoped Tutor** — an Agent-scoped system-prompt section instructs direct, pedagogically deep answers and evidence discipline.
2. **Exact inherited history** — the child owns the parent prefix through the chosen fork boundary.
3. **Persistent Citation Context** — an Agent runtime-context section named `@kirkchinese/dsh-citeciter:citation` quotes a self-delimiting JSON envelope as untrusted user-role context.
4. **Genuine user questions** — the first custom question and every follow-up are ordinary user messages.

The Citation envelope carries `historyStartSeq = child SessionHeader.seedLength`. System Prompt materializes it as an authoritative `user/message` snapshot event whose source names the plugin sections. The `citeciter` projection accepts only that exact provenance and section name; the first valid identity wins immutably. `contextSeq` is recorded for audit, but transcript filtering begins at `historyStartSeq` because the first question may be appended before runtime-context in the same model step.

## Isolation

The Host installs effects through the child `agent.ctx`, never globally:

- Tutor and Citation Context sections.
- An authoritative `tool/execute` guard that permits only the named read-only tools and the reserved `run_code` analysis transport. Every nested SDK dispatch crosses the same guard, and Host readiness separately requires the folded sandbox mode to remain `read-only`.
- Best-effort `tools.restrict({ allow })` defense in depth.
- A `system-prompt/assemble` waterfall filter so disallowed tool schemas are not advertised.

Citation text remains untrusted data even if it contains apparent instructions, delimiters, HTML, or role-shaped JSON. Read-only command failure, Host validation failure, unknown Remote contracts, or tool-guard failure is terminal for that operation; CiteCiter does not fall back to the parent permission policy.

## Durability, recovery, and archive

Thread discovery reads `SessionSummary.projectionValues.citeciter` and excludes `workspaces.list.archivedSessionIds`. The shell overlay exposes a persistent launcher whenever at least one unarchived Thread exists. Opening a projected Thread uses its concrete session face without changing the main GUI session. The transcript displays only child-owned user/assistant/error rows at or after `historyStartSeq`; inherited history and runtime-context rows stay out of the Thread transcript.

Rename uses `session.rename(title)`. Archive first stops an actually running child, then calls the supported `workspaces.archiveSession(sessionId)`. UI state is cleared only after durable archive success; errors remain visible and actionable. Archived Threads remain on disk but disappear from active discovery. CiteCiter currently has no unarchive UI or cold archived-session deduplication, so selecting the same Citation after archive can create a new active Thread.

## Lifecycle and races

The Client mounts its Typert Remote contribution, then waits through `ctx.inject(['remote.citeciter'], ...)` before accessing the namespace. Listener, workspace/session subscriptions, slots, details animation frame, Remote mount, and controller disposal all belong to the Client fiber. The details slot is registered before opening the layout column; a deferred second open handles root-layout reattachment after page reload.

A monotonically increasing operation epoch and serialized queue prevent fork/open/Remote/prompt work that resolves after selection change or disposal from reinstalling state. Unload removes browser effects and cancels only a currently running attached child as best effort; durable session data is not deleted. The Host tracks one disposer set per Agent, restores live/projected agents on activation, handles later `agent/created`, and releases every scoped effect on Agent or plugin teardown.

The parent session is evidence and UI grouping only. CiteCiter never writes a question, Citation Context, answer, cancellation, rename, or error into its log.
