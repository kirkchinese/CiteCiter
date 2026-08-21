import { type ISessions, type SessionId, type SettingsScope, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type ProviderOption, type TopicSnapshot, type TopicSummary } from '../topic.ts';
import type { CiteSelection } from './types.ts';
export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'error';
export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available';
export interface CompanionSnapshot {
    sourceSessionId: SessionId | null;
    phase: CompanionPhase;
    draftQuote: string | null;
    active: TopicSnapshot | null;
    topics: readonly TopicSummary[];
    providers: readonly ProviderOption[];
    settings: CiteCiterSettings;
    includeArchived: boolean;
    error: string | null;
}
type RemoteRequest = (request: CiteCiterRequest) => Promise<RemoteResult<CiteCiterResponse>>;
export interface CompanionFace {
    getSnapshot(): CompanionSnapshot;
    subscribe(listener: () => void): () => void;
    setSource(sessionId: SessionId | null): void;
    setVisible(visible: boolean): void;
    create(selection: CiteSelection, question: string, mode?: CreateMode): Promise<void>;
    openTopic(sessionId: string): Promise<void>;
    ask(question: string): Promise<void>;
    stop(): Promise<void>;
    rename(title: string): Promise<void>;
    archive(archived: boolean): Promise<void>;
    setIncludeArchived(include: boolean): void;
    selectModel(provider: string, model: string, reasoningEffort: string | null): Promise<void>;
    setSetting<Key extends keyof CiteCiterSettings>(key: Key, value: CiteCiterSettings[Key]): Promise<void>;
    dispose(): Promise<void>;
}
/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export declare function createCompanionController(sessions: ISessions, settingsScope: SettingsScope<CiteCiterSettings>, request: RemoteRequest, store?: SnapshotStore<CompanionSnapshot>): CompanionFace;
export {};
