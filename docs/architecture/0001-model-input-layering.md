# ADR 0001: Layer CiteCiter model input by authority and provenance

- Status: Accepted
- Date: 2026-08-18
- Target: CiteCiter v0.2
- Decision owner: CiteCiter maintainers

## Context

CiteCiter v0.1 sends one synthetic user message to a child session. That message combines four different things:

1. CiteCiter's tutor role and behavioral rules;
2. the selected quotation and its source metadata;
3. answer-shape guidance;
4. the user's actual request to explain the quotation.

The child is correctly forked from the selected assistant turn, so the historical prefix is exact and the parent session remains untouched. The combined message nevertheless gives plugin-authored instructions and quoted data the same durable provenance as words the user actually entered. It also leaves a long-lived explanation thread without an explicit, recoverable focus object.

DeepSeek Harness provides distinct model-input seats for these concerns:

- an agent-scoped system-prompt section for stable authority;
- durable user-role context produced by `agent.inject()` or an agent-scoped `SystemPrompt.context()` provider;
- an ordinary user prompt admitted as the next turn;
- an append-only session log from which every request is reconstructed.

DSH context injection is not a higher-priority message role. Injected context and direct prompts both become durable `user/message` events once accepted into a step; their `source` distinguishes plugin context from a human prompt. `agent.inject()` targets the next step and does not wake an idle agent. `SystemPrompt.context()` materializes dynamic runtime context as a durable user-role snapshot and can republish the current snapshot after a surface replacement such as compaction.

CiteCiter v0.2 also introduces custom questions, genuine multi-turn explanation, and recoverable citation threads. Those features require the selected quotation to remain an explicit thread invariant instead of prose embedded only in the first user bubble.

## Decision

CiteCiter will construct every explanation request from four deliberately separate layers:

```text
System authority    Scoped CiteCiter Tutor Contract
Historical evidence Exact child-session fork at the selected completed turn
Plugin context      Persistent Citation Context bound to the thread
Human intent        Genuine user question and later follow-ups
```

### 1. Scoped Tutor Contract

A Host contribution will install an agent-scoped system-prompt section for every identified CiteCiter child. The section defines the tutor role, evidence discipline, treatment of quoted content as untrusted data, and the prohibition against mutating the parent or project.

The contract must not contain the raw quotation. A quotation can contain instructions and therefore must never inherit system authority.

The first implementation may supplement the inherited deployment persona. If evaluation shows material conflicts with a coding-agent persona, CiteCiter may shadow the scoped deployment-persona seat for CiteCiter children. Either choice must remain agent-scoped and reversibly owned by that child or by the Host plugin's lifecycle.

### 2. Exact historical fork

The DSH session fork remains the source of historical truth. CiteCiter resolves the selected conversation key through the active parent snapshot, obtains the node's real `anchorSeq`, verifies that the source turn is complete, and forks at that boundary.

CiteCiter will not reconstruct, summarize, or copy the parent conversation into a synthetic prompt. The child must contain no parent events after the selected boundary, and CiteCiter must never append model-visible input to the parent.

### 3. Persistent Citation Context

Each explanation thread owns one immutable Citation record containing at least:

- source session id;
- source conversation anchor key;
- resolved anchor sequence;
- exact selected text;
- a stable selection fingerprint;
- bounded prefix and suffix evidence sufficient to disambiguate repeated text;
- a schema version.

The model-facing Citation Context contains the exact quotation and an explicit statement that the quotation is evidence to explain, not instructions to execute. Internal identifiers belong in durable metadata and need not be exposed in model-facing prose.

The preferred runtime seat is an agent-scoped `SystemPrompt.context()` contribution because the Citation is current thread state, not a one-off user instruction. Its durable runtime-context snapshot keeps plugin provenance separate from the human question and can be materialized again if compaction replaces the earlier snapshot. A direct `agent.inject()` call is acceptable as a bootstrap or fallback only when its no-wakeup, next-step ordering and post-compaction recovery are handled explicitly.

The Citation Context is installed before the first model request and restored before a resumed CiteCiter thread accepts another user question.

### 4. Genuine user questions

The initial custom question and every follow-up remain ordinary DSH user prompts. The default `Citer!` action represents the genuine user intent `Please explain this quotation in its historical context.`; it must not repeat the tutor contract or pretend that plugin-authored citation framing came from the user.

The child session therefore presents a clean transcript:

- Citation Context as plugin-produced context;
- the user's real question as a user message;
- model answers and subsequent questions as normal turns.

Context injection cannot replace the user prompt because it does not wake an idle agent and because doing so would misstate authorship.

## Citation Thread identity

A thread is not identified only by its parent session or selected turn. Its logical identity is derived from:

```text
sourceSessionId + anchorSeq + selectionFingerprint
```

Different selections from the same assistant answer create different threads by default. Reusing one child for every selection in a parent would either omit later source history or leak future history into an earlier citation. Parent sessions are a UI grouping axis, not a model-context identity.

Every thread remains a durable DSH child session. v0.2 must support discovering, reopening, switching, renaming, and archiving those children without using browser local storage as the sole source of truth.

## Host and Client planes

This decision changes CiteCiter from a Client-only plugin into an external Host+Client plugin while retaining the requirement that installation must not modify the DSH repository.

The Client owns:

- DOM selection and Citation draft creation;
- the context menu and details-panel UI;
- custom-question and follow-up composition;
- transcript rendering and thread navigation;
- source-session navigation and user actions.

The Host owns only behavior unavailable on the browser face:

- durable CiteCiter thread metadata and discovery;
- agent-scoped tutor-system and Citation-context registration;
- restoration of those scoped effects when a thread agent resumes;
- scoped tool visibility and execution guards;
- a minimal typed Client-to-Host boundary.

The Host must not implement a custom agent loop, reconstruct parent history, or drive hidden autonomous turns.

## Permission and capability invariants

The existing fail-closed ordering remains mandatory:

1. fork the child at the validated completed boundary;
2. open it without changing the current DSH session;
3. switch it to `/permission read-only`;
4. require command success and `matched: true`;
5. install or verify CiteCiter Host policy and Citation Context;
6. only then admit the first user question.

The combined v0.2 release may allow model-selected read-only inspection when it improves explanation quality. Tool visibility and guards must still prevent writes and privilege escalation. Effect quality takes priority over token or request cost, but not over isolation or explicit user control.

## Compaction and replay

The append-only child log remains authoritative. Ordinary prompts, injected context, model output, errors, and cancellation stay in the child log. Thread metadata must be durable and reconstructible after process restart.

If DSH compaction shadows the original Citation Context, CiteCiter must rematerialize the immutable current Citation before the next request. The compacted summary is not permitted to become the only surviving representation of the selected quotation.

## Evaluation gate

Implementation is gated by a reproducible, same-input comparison of three architectures:

- **A — Combined user prompt:** the v0.1 role, quotation, instructions, and question in one user message;
- **B — Citation context + user question:** plugin-produced Citation Context plus a genuine user question, with the inherited system prompt;
- **C — Tutor system + Citation context + user question:** the complete decision in this ADR.

Every case must use the same:

- parent-session event prefix and fork boundary;
- selected quotation;
- user question and follow-up sequence;
- provider, model, reasoning effort, and relevant sampling configuration;
- tool and permission policy unless the variant explicitly owns the difference.

The experiment must preserve raw outputs and usage metadata without committing credentials or generated private sessions. Evaluation will emphasize:

- grounding in the historical source context;
- directness and pedagogical usefulness;
- correct handling of ambiguity and missing evidence;
- resistance to instructions embedded in the quotation;
- consistency across follow-up turns;
- provenance-correct transcript behavior;
- parent-session non-interference.

Cost is recorded when available but is not a selection criterion for this phase. C is the architectural default, but real-model evidence may refine its prompt wording and whether the scoped tutor section supplements or replaces the inherited persona.

## Rejected alternatives

### Keep the combined user message

Rejected because it conflates authority, evidence, and human intent; misstates durable provenance; and provides no first-class recoverable Citation focus.

### Put everything in `agent.inject()`

Rejected because injection is still user-role context, does not wake an idle agent, and would misclassify the user's actual question as plugin-produced context.

### Put the quotation in the system prompt

Rejected because selected model output is untrusted data. Giving it system authority increases prompt-injection risk and confuses evidence with policy.

### Create a blank Tutor-preset session and copy parent context

Rejected because current DSH `fork()` inherits the source composition, while preset switching is restricted to blank sessions. Reconstructing history in a blank session would weaken the exact-fork invariant.

### Replace the DSH agent loop

Rejected because the default loop already supplies durable turns, steps, tool execution, streaming, cancellation, retries, and replay. CiteCiter's differentiating behavior belongs in scoped prompt/context, policy, and UI extension points.

## Consequences

- The package gains a real Host entry and Host dependencies.
- The Client/Host boundary and build pipeline must support an external plugin without DSH-core changes.
- Existing Client-only contributor guidance and lifecycle documentation must be revised as implementation lands.
- The v0.2 public release combines custom questions, real multi-turn dialogue, recoverable Citation Threads, and hard isolation; internal implementation may still proceed in separately verified milestones.
- Existing safe Markdown, SVG, HTML, and Cordis teardown behavior remains in force.
- No token budget, answer-length cap, cheap-model routing, or one-request-per-action requirement is imposed during this effect-first phase.
