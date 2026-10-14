import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions } from '../view-actions.ts';
/** Selection entry points, preset-action delivery, the new-Topic model and the eight action slots, saved together. */
export declare function ActionSettings({ snapshot, companion }: {
    snapshot: CompanionSnapshot;
    companion: CompanionActions;
}): import("react").JSX.Element;
