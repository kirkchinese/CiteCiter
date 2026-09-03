import { type UpdateController } from '../update-controller.ts';
/** Injected owner of the root-scoped update state. */
export interface UpdateNoticeProps {
    readonly updateController: UpdateController;
}
/**
 * Render the non-modal Web update notice in the frame-wide overlay.
 * @param props - root-scoped update actions and observable state.
 * @returns the available-version card, or no surface while current or suppressed.
 */
export declare function UpdateNotice({ updateController }: UpdateNoticeProps): import("react").JSX.Element | null;
