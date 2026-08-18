import type { Agent } from '@deepseek-ai/dsh-agent';
import { type CitationRecord } from './thread.ts';
/** Validate browser evidence against immutable fork lineage and log boundaries. */
export declare function validateCitation(agent: Agent, citation: CitationRecord): void;
