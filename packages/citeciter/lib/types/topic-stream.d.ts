/** Process-local Topic output; durable settlements remain owned by DSH Session. */
import type { AssistantStreamFrame } from '@deepseek-ai/dsh-agent';
import type { TopicMessage } from './topic.ts';
/** One Agent's ordered live stream. Dispose the instance with that Agent. */
export declare class TopicStreamProjection {
    private active;
    private readonly settled;
    /** Exact end-frame receipts keep an existing UI row mounted after durable settlement; aliases expire with this Agent. */
    get renderKeys(): ReadonlyMap<number, string>;
    /** @param frame - scoped Agent publication. @param nextSeq - current Session event count. */
    accept(frame: AssistantStreamFrame, nextSeq: number): void;
    /** @returns a detached display row, absent before visible output or after settlement. */
    snapshot(): TopicMessage | undefined;
}
