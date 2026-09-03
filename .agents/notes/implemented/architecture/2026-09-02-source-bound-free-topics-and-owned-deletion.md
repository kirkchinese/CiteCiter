# Agent Note: Source-bound free Topics and owned deletion

Status: implemented

## Problem

CiteCiter could create a Topic only from a selected Citation or another evidence claim. The Topic rail therefore had no honest way to start a general question attached to the current source Session. Its private Remote already exposed a delete command, but that command treated `SessionPersistence.locate()` as if it were a deletion API, removed the JSONL file without a crash-recovery record, and did not serialize every metadata writer against deletion.

DSH rc.2 deliberately provides no Session deletion or retention API. `locate()` is a side-effect-free artifact target hint, and `AgentHandle.dispose()` reaches Agent quiescence without itself promising that the persistence coordinator's asynchronous retirement has completed.

## Decision

A free Topic is still source-bound. Its create command carries the current `sourceSessionId`, a first question, Observer mode, and either the `qa` or `present` scenario. The Host validates the source Session before reserving Topic storage, inherits its cwd and latest committed model route, and records `citation: null`. Metadata schema v2 makes Citation absence explicit; v1 cited metadata is normalized to v2 when read. The first question supplies the temporary title and is admitted through the ordinary durable Agent path. Opening the client draft alone creates no Topic Session.

Free Topics receive no Citation Context. Their read-only `read_source_session` tool remains bound to the recorded source Session, but the tutor reads it only when the question needs source context. Cited Topics keep their existing first-question evidence behavior. Topic grouping remains by source Session rather than cwd or a new global index.

Permanent deletion is a CiteCiter-owned JSONL maintenance operation, not an extension of `SessionPersistence`. It is valid only for the fixed `$DSH_HOME/citeciter/sessions` backend mounted by CiteCiter's private Context. The current release assumes one active CiteCiter process owns a DSH home; it does not invent a cross-process lock without a second supported consumer.

Every Topic mutation and deferred metadata patch uses one per-Topic admission chain. Deletion publishes its deleting state before entering that chain, immediately rejects a pending user question, cancels the live Agent, and rejects queued or later mutations. Its admitted tail disposes the Agent and then calls rc.2 `readFrom(id, 0)`. That read waits for persistence retirement and the per-id serialization chain without retaining a prepared Session cache. Only then does CiteCiter atomically write a minimal `deleting.json` marker. Marker presence is the logical deletion commit and hides `topic.json` from list and load operations.

After commit, browser cancellation cannot interrupt physical cleanup. CiteCiter removes only a `kind: "jsonl"` artifact whose canonical parent remains below the canonical private root. A final symlink or junction is unlinked without following it; directories and special files are refused. Cleanup uses only non-recursive file unlink and empty-directory removal. Startup retries remaining markers before the Remote service becomes ready. A delete response reports `cleanup: "complete" | "pending"` separately from the committed logical deletion.

Archive remains the reversible operation and retains metadata and Session history. Permanent deletion has no user-visible recycle bin; `deleting.json` is only an internal recovery record.

## Alternatives considered

**Create a fake Citation.** Rejected because synthetic offsets and quote text would make an unattested record indistinguishable from Host-verified evidence.

**Show free Topics globally or group them by cwd.** Rejected because several Sessions can share one cwd, while the initiating source Session is already the precise navigation identity.

**Add `delete()` to SessionPersistence.** Rejected because rc.2 explicitly leaves retention and pruning to backend maintenance. CiteCiter owns one fixed JSONL deployment, not the semantics of SQLite or third-party stores.

**Use `inspect()` as the retirement barrier.** Rejected because it retains the complete cold Session in the prepared-session LRU. `readFrom(id, 0)` waits for the same rc.2 retirement chain without preparation caching.

**Delete JSONL before committing metadata deletion.** Rejected because a failure would leave a visible Topic whose history can no longer load. The marker makes the logical decision recoverable before any irreversible artifact removal.

## Consequences

Older cited Topic metadata remains readable and is projected as v2. New free Topics are distinguishable throughout the Host and Remote protocol by `citation: null`, so consumers must render a source-session context instead of dereferencing a quote.

A cleanup failure does not resurrect the Topic. The response and deletion event report `pending`, the marker keeps the Topic hidden, and startup retries the owner cleanup. Source Sessions, workspace files, imported documents, settings, and shared browser Citation anchors are outside the deletion target.

The permanent-delete guarantee is intentionally narrower than a general DSH Session delete. Supporting multiple live CiteCiter processes over one DSH home requires a separate ownership design or an upstream persistence deletion capability.
