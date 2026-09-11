import { BlockAssembler } from '@deepseek-ai/dsh-llm';
/** One Agent's ordered live stream. Dispose the instance with that Agent. */
export class TopicStreamProjection {
    active;
    /** @param frame - scoped Agent publication. @param nextSeq - current Session event count. */
    accept(frame, nextSeq) {
        if (frame.type === 'start') {
            this.active = { attemptId: frame.attemptId, seq: nextSeq, assembler: new BlockAssembler() };
        }
        else if (this.active?.attemptId === frame.attemptId) {
            if (frame.type === 'chunk')
                this.active.assembler.push(frame.chunk);
            else
                this.active = undefined;
        }
    }
    /** @returns a detached display row, absent before visible output or after settlement. */
    snapshot() {
        const active = this.active;
        if (active === undefined)
            return undefined;
        const blocks = active.assembler.blocks();
        const text = blocks.filter(block => block.type === 'text').map(block => block.text).join('\n');
        const reasoning = blocks.filter(block => block.type === 'reasoning').map(block => block.text).join('\n');
        if (text === '' && reasoning === '')
            return undefined;
        return {
            id: `partial:${active.attemptId}`, seq: active.seq, role: 'assistant', text,
            reasoning: reasoning === '' ? null : reasoning, streaming: true,
        };
    }
}
