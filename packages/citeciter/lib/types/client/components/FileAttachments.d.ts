import type { ComposerAttachment, DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { NativeComposer } from '../native-composer.ts';
/** Native Conversation-owned file drafts. The owning controller handles upload and lifetime. */
export declare function FileAttachments({ files, remove, native, sessionId }: {
    readonly files: readonly ComposerAttachment[];
    readonly remove: (id: DraftAttachmentId) => void;
    readonly native: NativeComposer;
    readonly sessionId: string;
}): import("react").JSX.Element;
