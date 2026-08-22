import { type ISessions, type SessionId, type SettingsScope, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type ProviderOption, type QuestionAnswer, type TopicSnapshot, type TopicSummary } from '../topic.ts';
import type { CiteSelection } from './types.ts';
export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'stopping' | 'stopped' | 'error';
export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available';
export type TopicsStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SettingsSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export interface CompanionSnapshot {
    sourceSessionId: SessionId | null;
    phase: CompanionPhase;
    draftQuote: string | null;
    sourceAnchorKey: string | null;
    active: TopicSnapshot | null;
    topics: readonly TopicSummary[];
    topicsStatus: TopicsStatus;
    topicsError: string | null;
    providers: readonly ProviderOption[];
    settings: CiteCiterSettings;
    settingsSaveStatus: SettingsSaveStatus;
    settingsSaveMessage: string | null;
    modelRouteSaving: boolean;
    reasoningEffortSaving: boolean;
    renaming: boolean;
    archiving: boolean;
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
    ask(question: string): Promise<boolean>;
    answerQuestion(key: string, answer: QuestionAnswer): Promise<void>;
    cancelQuestion(key: string): Promise<void>;
    stop(): Promise<void>;
    rename(title: string): Promise<boolean>;
    archive(archived: boolean): Promise<boolean>;
    setIncludeArchived(include: boolean): void;
    setModelRoute(provider: string, model: string): Promise<void>;
    setReasoningEffort(reasoningEffort: string | null): Promise<void>;
    setSetting<Key extends keyof CiteCiterSettings>(key: Key, value: CiteCiterSettings[Key]): Promise<void>;
    dispose(): Promise<void>;
}
/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export declare function createCompanionController(sessions: ISessions, settingsScope: SettingsScope<CiteCiterSettings>, request: RemoteRequest, onAutoOpen?: () => void, store?: SnapshotStore<CompanionSnapshot>): CompanionFace;
export {};
