# Agent Note: Browser structural selection mapping

Status: implemented

## Problem

Chromium selection text does not preserve the same separators as the Markdown projection across paragraphs, list items, and nested lists. The browser may omit a list-item separator or emit a newline where the mapper inserted a space, so a valid multi-block answer selection produced no citation candidate. Cross-flow selection also included the DSH reasoning projection in `sourceHintText`, while the Host validates only committed text blocks.

## Decision

Mark only separators introduced by the Markdown mapper as synthetic. Exact and compact-whitespace matching remain preferred; a final fallback lets each synthetic separator match zero or more browser whitespace characters while retaining the original Markdown offsets. Whitespace originating inside answer text remains exact.

Exclude DSH reasoning and Read Frog translation projections when collecting committed DOM text.

## Alternatives considered

Removing all whitespace from both strings was rejected because it would map distinct answer text such as `foo bar` and `foobar`.

## Consequences

Selections spanning lists and nested blocks map to one authoritative Markdown range, and cross-flow hints contain only committed answer text. Citation requests, Topic files, and Session formats are unchanged.
