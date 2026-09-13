import type { NativeComposer } from '../native-composer.ts';
export interface MessageAttachment {
    readonly kind: 'image' | 'file';
    readonly id: string;
    readonly name: string;
}
/** Render durable native attachments with a session-authorized loader and owned object URLs. */
export declare function MessageAttachments({ sessionId, attachments, load }: {
    readonly sessionId: string;
    readonly attachments: readonly MessageAttachment[];
    readonly load: NativeComposer['attachment'];
}): import("react").JSX.Element;
