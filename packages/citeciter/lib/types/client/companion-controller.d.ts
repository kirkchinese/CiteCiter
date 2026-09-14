import type { NativeComposer, DeliveryMode } from './native-composer.ts';
import type { DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type ProviderOption, type QuestionAnswer, type TopicScenario, type TopicSnapshot, type TopicSummary } from '../topic.ts';
import { type CreateMode, type DocumentClaimIntent } from './request-guard.ts';
import type { ActionModel } from '../actions.ts';
import type { CiteSelection } from './types.ts';
export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'stopping' | 'stopped' | 'error';
export type { CreateMode } from './request-guard.ts';
export type TopicsStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SettingsSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export interface CompanionSnapshot {
    composeSeed: {
        readonly sessionId: string;
        readonly question: string;
        readonly id: string;
    } | null;
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
    create(selection: CiteSelection, question: string, mode?: CreateMode, scenario?: TopicScenario, modelRoute?: ActionModel): Promise<void>;
    createFree(question: string, scenario: Extract<TopicScenario, 'qa' | 'present'>): Promise<boolean>;
    /** Create a Reading Topic; rejects on failure so the Reader retains the unsent question. */
    createFromDocument(claim: DocumentClaimIntent, question: string, sourceSessionId?: SessionId, modelRoute?: ActionModel): Promise<void>;
    openTopic(sessionId: string): Promise<void>;
    ask(question: string, attachments?: readonly DraftAttachmentId[], mode?: DeliveryMode): Promise<boolean>;
    setPermission(mode: NonNullable<CiteCiterSettings['defaultPermission']>): Promise<void>;
    answerQuestion(key: string, answer: QuestionAnswer): Promise<void>;
    cancelQuestion(key: string): Promise<void>;
    boardCaptureReply(sessionId: string, id: string, png?: string, error?: string): Promise<void>;
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
export declare function createCompanionController(readChat: (sessionId: SessionId) => ChatSnapshot | undefined, settingsScope: SettingsScope<CiteCiterSettings>, request: RemoteRequest, onAutoOpen: () => void, store: SnapshotStore<CompanionSnapshot>, nativeComposer: NativeComposer): CompanionFace;
