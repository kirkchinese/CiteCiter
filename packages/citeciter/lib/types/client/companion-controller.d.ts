import type { NativeComposer, DeliveryMode } from './native-composer.ts';
import type { DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SettingsForm } from './host-ui-adapter.ts';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type ProviderOption, type QuestionAnswer, type TopicSnapshot, type TopicSummary } from '../topic.ts';
import { type DocumentClaimIntent } from './request-guard.ts';
import type { ActionModel } from '../actions.ts';
import type { CiteSelection } from './types.ts';
import { type DraftReference } from './draft-references.ts';
export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'stopping' | 'stopped' | 'error';
export type TopicsStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SettingsSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export interface ComposeSeed {
    readonly sessionId: string;
    readonly question: string;
    readonly id: string;
    readonly references: readonly DraftReference[];
}
export interface CompanionSnapshot {
    composeSeeds: readonly ComposeSeed[];
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
    deleting: boolean;
    notice: string | null;
    includeArchived: boolean;
    error: string | null;
}
type RemoteRequest = (request: CiteCiterRequest, signal: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>;
export interface CompanionFace {
    getSnapshot(): CompanionSnapshot;
    subscribe(listener: () => void): () => void;
    setSource(sessionId: SessionId | null): void;
    retainVisible(): () => void;
    create(selection: CiteSelection, question: string, modelRoute?: ActionModel): Promise<void>;
    createFree(question: string): Promise<boolean>;
    /** Create a Reading Topic; rejects on failure so the Reader retains the unsent question. */
    createFromDocument(claim: DocumentClaimIntent, question: string, sourceSessionId?: SessionId, modelRoute?: ActionModel): Promise<void>;
    openTopic(sessionId: string): Promise<void>;
    /** Resolve only the explicitly selected, unarchived Topic; null means create a new one. */
    resolveDraftTopic(sourceSessionId: SessionId): Promise<string | null>;
    /** Append to the exact still-selected Topic; never change its route, permissions or running turn. */
    appendSelection(sourceSessionId: SessionId, topicSessionId: string, question: string, references: readonly DraftReference[]): void;
    /** Acknowledge a draft event only after its UI consumer accepted it. */
    consumeComposeSeed(id: string): void;
    ask(question: string, attachments?: readonly DraftAttachmentId[], mode?: DeliveryMode, requestId?: string, expectedSessionId?: string): Promise<boolean>;
    setPermission(mode: NonNullable<CiteCiterSettings['defaultPermission']>): Promise<void>;
    answerQuestion(key: string, answer: QuestionAnswer): Promise<void>;
    cancelQuestion(key: string): Promise<void>;
    stop(): Promise<void>;
    rename(title: string): Promise<boolean>;
    archive(archived: boolean): Promise<boolean>;
    deleteTopic(confirmSessionId: string): Promise<'complete' | 'pending' | false>;
    dismissError(): void;
    setIncludeArchived(include: boolean): void;
    setModelRoute(provider: string, model: string): Promise<void>;
    setReasoningEffort(reasoningEffort: string | null): Promise<void>;
    setSetting<Key extends keyof CiteCiterSettings>(key: Key, value: CiteCiterSettings[Key]): Promise<void>;
    dispose(): Promise<void>;
}
/** Initial browser snapshot for the root-scoped CiteCiter controller. */
export declare const INITIAL_COMPANION_SNAPSHOT: CompanionSnapshot;
/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export declare function createCompanionController(readChat: (sessionId: SessionId) => ChatSnapshot | undefined, configForms: SettingsForm<CiteCiterSettings>, request: RemoteRequest, onAutoOpen: () => void, store: SnapshotStore<CompanionSnapshot>, nativeComposer: NativeComposer): CompanionFace;
export {};
