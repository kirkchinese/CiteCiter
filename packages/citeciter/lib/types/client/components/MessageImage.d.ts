import type { NativeComposer } from '../native-composer.ts';
import type { MessageAttachment } from './MessageAttachments.tsx';
/** Own an authorized image URL and its preview for exactly one mounted attachment. */
export declare function MessageImage({ sessionId, attachment, load }: {
    readonly sessionId: string;
    readonly attachment: MessageAttachment;
    readonly load: NativeComposer['attachment'];
}): import("react").JSX.Element;
