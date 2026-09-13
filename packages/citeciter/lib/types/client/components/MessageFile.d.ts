import type { NativeComposer } from '../native-composer.ts';
import type { MessageAttachment } from './MessageAttachments.tsx';
/** Accessible file chip. The download hook owns requests and object URLs. */
export declare function MessageFile({ sessionId, attachment, load }: {
    readonly sessionId: string;
    readonly attachment: MessageAttachment;
    readonly load: NativeComposer['attachment'];
}): import("react").JSX.Element;
