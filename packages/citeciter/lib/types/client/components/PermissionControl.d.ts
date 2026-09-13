import type { CiteCiterSettings } from '../../topic.ts';
export type PermissionMode = NonNullable<CiteCiterSettings['defaultPermission']>;
/** Explicit permission selection; receives the Host's effective value. */
export declare function PermissionControl({ value, onChange }: {
    readonly value: PermissionMode;
    readonly onChange: (mode: PermissionMode) => void;
}): import("react").JSX.Element;
