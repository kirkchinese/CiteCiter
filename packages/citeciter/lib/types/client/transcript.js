function coreText(blocks) {
    return blocks.flatMap((block) => {
        if (typeof block !== 'object' || block === null)
            return [];
        const candidate = block;
        return candidate.type === 'text' && typeof candidate.text === 'string' ? [candidate.text] : [];
    }).join('');
}
function assistantText(blocks) {
    return blocks.flatMap((block) => {
        if (typeof block !== 'object' || block === null)
            return [];
        const candidate = block;
        return candidate.kind === 'text' && typeof candidate.text === 'string' ? [candidate.text] : [];
    }).join('');
}
/**
 * Extract only child-owned genuine questions, answers, and durable errors.
 * Runtime-context and permission-command rows remain in the log but are not
 * duplicated in this focused teaching transcript.
 */
export function extractTranscript(snapshot, historyStartSeq) {
    const entries = [];
    for (const node of snapshot.nodes) {
        if (node.seq < historyStartSeq)
            continue;
        if (node.kind === 'user' || node.kind === 'steering') {
            const text = coreText(node.content);
            if (text !== '')
                entries.push({
                    id: `${node.kind}:${node.seq}`,
                    role: 'user',
                    text,
                    streaming: false,
                });
            continue;
        }
        if (node.kind === 'assistant') {
            const text = assistantText(node.blocks);
            if (text !== '')
                entries.push({
                    id: `assistant:${node.seq}`,
                    role: 'assistant',
                    text,
                    streaming: false,
                });
            continue;
        }
        if (node.kind === 'turn-error') {
            entries.push({
                id: `error:${node.seq}`,
                role: 'error',
                text: node.message,
                streaming: false,
            });
        }
    }
    if (snapshot.partial !== null) {
        const text = assistantText(snapshot.partial.blocks);
        if (text !== '')
            entries.push({
                id: `partial:${snapshot.partial.turn}:${snapshot.partial.step}`,
                role: 'assistant',
                text,
                streaming: true,
            });
    }
    return entries;
}
