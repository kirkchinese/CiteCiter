/**
 * Client entry-point registry: every "start a Citer from here" surface
 * contributes one entry that probes the pointer event and claims a selection.
 * Entries run in registration order; the first claim wins and is allowed to
 * prevent the native context menu.
 */
import type { ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteSelection } from './types.ts';
/** Live browser facts an entry needs to resolve one selection. */
export interface CiteCiterEntryContext {
    readonly sessions: ISessions;
    readonly sourceSessionId: SessionId;
}
/** One Citer entry point: probe, capture, and claim a selection from the DOM. */
export interface CiteCiterEntry {
    /** Stable entry identity recorded on the claimed selection. */
    readonly id: string;
    /**
     * Claim the current pointer event for this entry.
     * @param event - context-menu event whose position anchors the claim.
     * @param context - current source session and its bindings.
     * @returns a validated selection, or null when this entry does not own the event.
     */
    claim(event: MouseEvent, context: CiteCiterEntryContext): CiteSelection | null;
}
/** Mutable ordered entry registry with effect-style registration. */
export interface CiteCiterEntryRegistry {
    /**
     * Append one entry.
     * @param entry - immutable entry contribution.
     * @returns disposer removing the exact entry.
     */
    register(entry: CiteCiterEntry): () => void;
    /** Registered entries in claim order. */
    list(): readonly CiteCiterEntry[];
    /**
     * Ask entries in order for a claimed selection.
     * @returns the first entry claim, or null when no entry owns the event.
     */
    claim(event: MouseEvent, context: CiteCiterEntryContext): {
        readonly entry: CiteCiterEntry;
        readonly selection: CiteSelection;
    } | null;
}
/** Create an ordered client entry registry. */
export declare function createCiteCiterEntryRegistry(): CiteCiterEntryRegistry;
/**
 * Built-in assistant answer entry: resolves a selection inside a committed
 * `assistant-step` flow, including collapsed reasoning disclosure rows.
 * @returns the entry contribution; register it on the shared registry.
 */
export declare function createAssistantEntry(): CiteCiterEntry;
/**
 * Built-in tool evidence entry: claims a whole-card tool result from its
 * `call:<callId>` row and the enclosing `tool-call` chat flow. Terminal and
 * diff cards select their dedicated projections; everything else is
 * `result-text`.
 * @returns the entry contribution; register it after the assistant entry.
 */
export declare function createToolEvidenceEntry(): CiteCiterEntry;
