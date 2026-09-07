import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { UpdateNoticeSnapshot } from '../update-controller.ts';
import type { UpdateActions } from '../view-actions.ts';
/** Injected owner of the root-scoped update state. */
export interface UpdateNoticeProps {
    readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>;
    readonly updateController: UpdateActions;
}
/**
 * Render the non-modal Web update notice in the frame-wide overlay.
 * @param props - root-scoped update actions and observable state.
 * @returns the available-version card, or no surface while current or suppressed.
 */
export declare function UpdateNotice({ useUpdate, updateController }: UpdateNoticeProps): import("react").JSX.Element | null;
