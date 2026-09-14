import { type DragEvent } from 'react';
/**
 * Isolate file drags inside one physical panel from document-level drop owners.
 * @param open - whether the owning panel is mounted and available.
 * @param enabled - whether a current Topic can receive attachments.
 * @param onFiles - receive one dropped batch; never submits a model request.
 * @returns the local invitation state and handlers to spread on the panel root.
 * Global cancellation listeners exist only while open and are released on cleanup.
 */
export declare function useFileDrop(open: boolean, enabled: boolean, onFiles: (files: readonly File[]) => void): {
    active: boolean;
    handlers: {
        onDragEnter: (event: DragEvent<HTMLElement>) => void;
        onDragOver: (event: DragEvent<HTMLElement>) => void;
        onDragLeave: (event: DragEvent<HTMLElement>) => void;
        onDrop: (event: DragEvent<HTMLElement>) => void;
    };
};
