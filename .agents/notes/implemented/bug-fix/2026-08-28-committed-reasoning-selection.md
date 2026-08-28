# Committed reasoning selection

## Problem

CiteCiter projected only `text` blocks and rejected every selection inside the DSH reasoning container. This prevented citations from reasoning-only model calls and from selections spanning reasoning and answer text. The same restriction also hid committed intermediate model calls while the surrounding Agent turn continued.

## Decision

Client and Host project committed assistant content in renderer order: each `reasoning` block is followed by the renderer paragraph break, then `text` blocks continue the projection. The browser excludes only the generated reasoning disclosure header and other generated controls; expanded reasoning text remains selectable.

A committed `assistant/message` remains sufficient while its step or outer turn is open. Still-streaming chunks remain unavailable because they do not yet provide a stable source message.

## Compatibility

New citations use the combined reasoning-and-answer projection. Existing citations created from the earlier text-only projection remain valid through a Host-side text-only fallback. Topic files, Session logs, settings, and Remote fields do not change.

This note supersedes only the reasoning-exclusion decision in `2026-08-27-browser-structural-selection-mapping.md`; that note remains unchanged as the v0.4.2 record.
