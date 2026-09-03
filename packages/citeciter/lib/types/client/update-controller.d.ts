import { type SettingsScope, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteCiterSettings } from '../topic.ts';
type UpdateStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
/** One newer package version returned by the validated Host check. */
export interface AvailableUpdate {
    readonly currentVersion: string;
    readonly latestVersion: string;
}
/** Observable state shared by the update card and settings page. */
export interface UpdateNoticeSnapshot {
    available: AvailableUpdate | null;
    checking: boolean;
    copyStatus: 'idle' | 'copying' | 'copied' | 'error';
    copyMessage: string | null;
    notificationsEnabled: boolean;
    preferenceReady: boolean;
    preferencePersistence: 'host' | 'browser';
    preferenceStatus: 'idle' | 'saving' | 'saved' | 'error';
    preferenceMessage: string | null;
}
/** Initial root-scoped update-notice state. */
export declare const INITIAL_UPDATE_SNAPSHOT: UpdateNoticeSnapshot;
/** Browser APIs used by the update controller. */
export interface UpdateBrowserEnvironment {
    readonly document: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>;
    readonly sessionStorage: UpdateStorage;
    readonly localStorage: UpdateStorage;
    readonly clipboard: Pick<Clipboard, 'writeText'> | undefined;
    readonly now: () => number;
}
/** Operations exposed to the update notice and settings page. */
export interface UpdateController {
    getSnapshot(): UpdateNoticeSnapshot;
    subscribe(listener: () => void): () => void;
    start(): Promise<void>;
    copyUpdateCommand(): Promise<void>;
    defer(): void;
    setNotificationsEnabled(enabled: boolean): Promise<boolean>;
    dispose(): Promise<void>;
}
/** Read a newer validated version, or null when the installed version is current. */
export type CheckUpdate = (signal: AbortSignal) => Promise<AvailableUpdate | null>;
/** @returns browser services without letting denied storage or clipboard getters break plugin mount. */
export declare function createUpdateBrowserEnvironment(): UpdateBrowserEnvironment;
/**
 * Own update discovery, deferral, copy feedback, and preference persistence.
 * @param settings - existing CiteCiter settings namespace scope.
 * @param checkUpdate - validated Host version check; it never installs software.
 * @param store - root-scoped observable state owned by the client runtime.
 * @param environment - browser APIs, injectable for deterministic tests.
 * @param reportCheckError - diagnostic sink for silent automatic-check failures.
 * @returns the root-scoped update controller.
 */
export declare function createUpdateController(settings: SettingsScope<CiteCiterSettings>, checkUpdate: CheckUpdate, store: SnapshotStore<UpdateNoticeSnapshot>, environment?: UpdateBrowserEnvironment, reportCheckError?: (error: unknown) => void): UpdateController;
/** @param version - validated latest package version. @returns the command shown and copied by the Web notice. */
export declare function citeCiterUpdateCommand(version: string): string;
export {};
