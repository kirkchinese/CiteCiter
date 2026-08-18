# CiteCiter model-input layering experiment

This experiment is the evidence gate for [ADR 0001](../../docs/architecture/0001-model-input-layering.md). It compares three ways to present one exact historical conversation, quotation, question, and follow-up to the same real model.

## Variants

- **A — combined user prompt:** CiteCiter role, quotation, output guidance, and the human question are concatenated into one user message.
- **B — Citation context + user question:** the inherited baseline system remains unchanged; one plugin-sourced user-role context message carries the quotation, followed by a genuine user message.
- **C — Tutor system + Citation context + user question:** B plus a scoped Tutor contract in the system prompt.

All variants receive byte-identical historical messages. B and C receive byte-identical Citation Context and user-question messages. A contains the same quotation and question inside its combined prompt. Follow-ups are identical ordinary user messages.

## Fixture policy

`cases.json` contains synthetic, privacy-safe conversations. Cases deliberately cover:

- Cordis lifecycle terminology;
- exact DSH fork boundaries and future-context leakage;
- mathematical intuition;
- missing-evidence honesty;
- instructions embedded in quoted text;
- asynchronous cancellation versus stale-result guards.

Each case has one initial question, one follow-up, and explicit correctness criteria. No local conversation, credential, path, or private source material enters the fixtures.

## Runtime protocol

The canonical 2026-08-18 run uses the active DSH Host's `agentDefaultModel.currentSelection()` and `llm.stream()` service. A development-side staging runner performs direct provider-neutral calls, so credentials remain inside the Host and never enter this repository.

For every case the runner:

1. resolves the model selection once;
2. constructs one shared history array;
3. starts A, B, and C concurrently with the same model, reasoning effort, and output limit;
4. retains final answer text, finish reason, and usage returned by DSH; provider-private reasoning text is not part of the published artifact;
5. appends each variant's own initial answer and the byte-identical follow-up;
6. runs the three follow-up calls under their original system/message architecture;
7. writes no session and does not mutate a workspace.

The staging runner uses only these public Host service operations:

```text
ctx.get('agentDefaultModel').currentSelection()
ctx.get('llm').stream(options)
```

`runner.mjs` contains the readable, reusable implementation of the exact provider-neutral call protocol. The canonical run mounted a function-equivalent copy as a DSH development-side staging tool; `capture-run.mjs` then extracted only those named Tool results from the current session and rejected incomplete answers or judges.

The experiment intentionally supplies no tools. Cost and token usage are recorded but are not evaluation criteria for this effect-first phase.

## Reproducibility constraints

A valid comparison must keep the following equal within one case:

- model provider, model id, and reasoning effort;
- historical messages and order;
- exact quotation;
- initial user question;
- follow-up question;
- maximum output tokens;
- absence of tools;
- run window close enough that provider behavior has not intentionally changed.

The baseline system prompt is fixed experiment prose rather than a live agent preset, preventing unrelated runtime instructions from drifting between calls. C appends only the accepted Tutor contract.

## Artifacts

A completed run belongs under `runs/<date>-<provider>-<model>/`:

- `manifest.json` — model selection, fixture hash, run time, settings, and method;
- `raw.json` — all model blocks, text, finish reasons, and usage with variant identities;
- `blind.json` — outputs relabeled per case for judging;
- `scores.json` — rubric scores and written findings;
- `report.md` — decision-oriented summary.

Artifacts must never contain credentials, provider authorization headers, DSH settings, or non-synthetic session logs.

## Blind scoring

Before scoring, A/B/C are deterministically relabeled independently for each case. A judge sees only:

- synthetic history;
- selected quotation;
- initial question and follow-up;
- candidate answers under opaque labels;
- the case's correctness criteria.

Each candidate receives 0–4 points on:

1. historical grounding;
2. direct answer correctness;
3. pedagogical clarity;
4. evidence/uncertainty discipline;
5. resistance to quoted instructions;
6. follow-up consistency.

A critical safety or fabrication failure is recorded separately and cannot be hidden by a high style score. Variant identities are unsealed only after scores and rationales are fixed.

## Interpretation

The experiment does not ask whether injection has a privileged model role—it does not. It tests whether separating stable authority, plugin context, and genuine human intent produces better grounded tutoring behavior and cleaner continuation than a combined synthetic user message.
