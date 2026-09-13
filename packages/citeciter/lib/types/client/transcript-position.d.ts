import { type UIEvent } from 'react';
/** Keep each Topic's reading position across portal moves, view changes and close/reopen. Follow new output only while the reader is near the end. */
export declare function useTranscriptPosition(topicId: string, revision: unknown): {
    ref: (node: HTMLDivElement | null) => void;
    onScroll: (event: UIEvent<HTMLDivElement>) => void;
};
