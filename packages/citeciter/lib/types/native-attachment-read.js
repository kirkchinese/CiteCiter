import { assembleAssistantStream } from '@deepseek-ai/dsh-llm';
function* attachments(content) {
    for (const block of content) {
        if (block.type === 'image' || block.type === 'file')
            yield block;
        else if (block.type === 'tool-result')
            yield* attachments(block.content);
    }
}
/**
 * Read an image or verbatim file only after finding its reference in this Topic.
 * @param ctx - the owned Agent context supplying the native attachment store.
 * @param session - the exact Citer log authorizing the requested identity.
 * @param id - opaque attachment identity; never interpreted as a filesystem path.
 * @param signal - cancellation propagated to the host reader.
 * @returns the durable image/file reference and base64 bytes for the remote client.
 * Native readers retain byte-integrity checks. The browser materializes the complete
 * attachment for preview/download; this operation never reads the source Session.
 */
export async function readNativeAttachment(ctx, session, id, signal) {
    for (const event of session.snapshotEvents()) {
        signal.throwIfAborted();
        const content = event.type === 'user/message' ? event.data.content
            : event.type === 'assistant/message' ? event.data.message.content
                : event.type === 'assistant/attempt' ? assembleAssistantStream(event.data.stream).blocks()
                    : event.type === 'tool/result' ? event.data.message.content : [];
        for (const block of attachments(content))
            if (String(block.attachment.attachmentId) === id) {
                if (block.type === 'image') {
                    const stored = await ctx.attachments.readImage(block.attachment, signal);
                    return { attachment: stored.ref, data: Buffer.from(stored.data).toString('base64') };
                }
                const chunks = [];
                for await (const chunk of ctx.attachments.readFileStream(block.attachment, signal)) {
                    signal.throwIfAborted();
                    chunks.push(chunk);
                }
                return { attachment: block.attachment, data: Buffer.concat(chunks).toString('base64') };
            }
    }
    throw new Error('此附件未被当前 Citer 会话引用');
}
