import type { Session } from '@deepseek-ai/dsh-session';
/** Read an immutable document only after checking the requesting Session's submitted attachments. The caller owns authorization and storage; tools own ranges, output budgets and model-visible guidance. */
export type AuthorizedDocumentReader = (requested: string | undefined, session: Session | undefined) => Promise<{
    readonly documentId: string;
    readonly content: string;
}>;
/** Build a bounded document reader. Offsets and documentLength count UTF-16 code units, while bytesUsed measures the UTF-8 response text. Invalid ranges remain errors; they are never silently clamped. */
export declare function createDocumentReadTool(read: AuthorizedDocumentReader): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Build document search independently of Topic lifecycle. Returns the document horizon so the model can expand a match without inventing an out-of-range endpoint. */
export declare function createDocumentSearchTool(read: AuthorizedDocumentReader): import("@deepseek-ai/dsh-tools").ToolDefinition;
