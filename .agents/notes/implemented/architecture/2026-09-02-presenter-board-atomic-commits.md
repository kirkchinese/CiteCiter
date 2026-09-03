# Agent Note: Presenter board atomic commits

Status: implemented

## Problem

Presenter originally accepted board operations from both assistant text control blocks and `blackboard_apply` calls, then projected a call before its result established whether execution succeeded. The two channels gave one board update competing commit meanings, exposed protocol markup to the answer stream, and allowed a rejected tool call to change the replayed board. Sending every historical operation in each Topic snapshot also made polling cost grow with Topic history.

## Decision

Protocol v4 has one commit fact: a `blackboard_apply` `tool/call` paired by `callId` with a successful `tool/result`. Failed, cancelled, interrupted, and unpaired calls do not change board state. The projector applies each successful batch to a temporary map and publishes the new map only when every operation and the complete resulting board satisfy protocol limits.

`blackboard_apply` exposes the complete operation union through the rc.2 `defineTool` schema DSL. The executor performs the regex, numeric-range, cross-field, content-kind, target-existence, and complete-result budget checks that the model-facing DSL cannot express. Stateful operations reject unknown targets, while `remove` remains idempotent. Tool execution is exclusive because the definition does not opt into concurrent scheduling.

`BoardSnapshot` contains the final ordered elements, the successful-commit revision, and an invalid successful-record count. It does not carry operation history or streaming assistant operations. The durable Session remains the authority; no plugin event extends `SessionEventMap`.

The built-in scenario prompt always precedes optional user teaching preferences, and an invariant reminder follows them. Preferences can change teaching style but cannot replace read-only behavior, evidence handling, tool policy, or the board protocol.

## Alternatives considered

**Keep assistant control blocks as a low-latency channel.** This was rejected because partial text has no tool execution result and therefore cannot share the atomic commit rule. It also couples answer formatting to protocol parsing and makes malformed or trailing markup a user-visible concern.

**Project every `tool/call` immediately.** This was rejected because a call is only a request. DSH records the normalized success or failure on `tool/result`; using the request alone contradicts the tool pipeline's commit point.

**Add a board-specific Session event.** This was rejected because the existing call/result pair already records every model-visible input and outcome. A second durable fact could disagree with the tool log and would require every session reader to understand a new required event.

**Keep operation history in every snapshot.** This was rejected because replay belongs on the Host and polling consumers need only the current render state. Final-state snapshots keep transport and client folding bounded by the board budget rather than Topic length.

## Consequences

The board changes only after a tool result commits, so it does not render partial JSON while a model is streaming. Standard Agent steps still support incremental teaching: the model can submit a small batch, explain it, and submit later updates.

The browser bundle inlines KaTeX CSS and woff2 fonts. Mathematical board elements therefore keep their layout without a public asset route or external font request.

Pre-release v1-v3 board control blocks and op-history snapshots are not compatibility inputs. Existing Topic logs remain intact, but v4 does not interpret their assistant markup as board state.

The final board is limited to 50 elements and 500,000 UTF-8 content bytes, and one commit is limited to 50 operations. These are protocol and resource-safety limits rather than deployment tunables.
