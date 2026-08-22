# Agent Note: Host-authoritative citations and metadata-only Topic lists

Status: implemented

## Problem

The browser projection of a DSH answer is not durable evidence: branches, Markdown rendering, translation overlays, and concurrent UI refreshes can differ from the committed Session event. Topic creation also allowed the private Agent to start before its navigation metadata existed, while list polling replayed unrelated logs and amplified races.

## Decision

The browser sends a `CitationSelectionClaim` containing the source Session id, committed assistant anchor, visible quote, and nearby rendered context. The Host reads that `assistant/message`, maps the claim to its Markdown UTF-16 range with the shared GFM mapper, and creates the immutable Citation fingerprint.

The Host accepts the legacy v0.3.1 Citation payload during hot upgrades. Topic and Session disk formats stay unchanged.

Topic creation persists the initial private Session and atomically writes `topic.json` before starting the first Agent request. Failed creation disposes the Agent and removes both artifacts. Topic lists read metadata, hydrate a missing cached title once, and defer source availability reads to creation, opening, or source-tool use.

Exact Fork keeps DSH's completed-turn requirement. An open turn falls back only for `exact-when-available`; forced Exact fails before Topic creation. Inherited titles are ignored, and the existing DSH LLM title service generates one title from the first post-seed question.

## Alternatives considered

**Trust browser Markdown and offsets.** This keeps the request smaller but lets presentation state define durable evidence and fails when a branch or renderer projection differs from the Session log.

**Copy source logs into every Topic.** This makes each Topic self-contained but duplicates large histories and prevents Observer Topics from reading newly committed evidence.

**Replay all Topic and source logs during list polling.** This derives every field on demand but makes navigation cost proportional to conversation history and introduces unnecessary concurrent reads.

## Consequences

Citation creation performs one authoritative source read and rejects ambiguous mappings. Existing pages continue through the legacy request path, while new pages no longer submit a browser-generated fingerprint.

Navigation remains fast for normal personal Topic counts. A Topic without cached title data performs one private-log hydration per Host process; opening that Topic performs the full incremental projection. The metadata lookup remains linear across private Topic directories and can gain an id index if personal stores reach thousands of Topics.
