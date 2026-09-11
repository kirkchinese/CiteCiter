/** Private CiteCiter document library: durable text/Markdown sources for Reading Topics. */
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { dshHomePath } from '@deepseek-ai/dsh-home-paths';
import { documentContentSchema, documentSummarySchema, } from "./topic.js";
import { documentPages } from "./document-pages.js";
export { DOCUMENT_CONTENT_MAX_BYTES } from "./document-pages.js";
const DOCUMENT_ROOT = dshHomePath('citeciter', 'documents');
function errorCode(error) {
    return typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : undefined;
}
function assertContained(root, target) {
    const path = relative(resolve(root), resolve(target));
    if (path === '' || path.startsWith('..') || isAbsolute(path)) {
        throw new Error('CiteCiter refused a path outside its private document root');
    }
}
async function atomicWriteJson(path, value) {
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
        await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        await rename(temp, path);
    }
    catch (error) {
        try {
            await unlink(temp);
        }
        catch (cleanupError) {
            if (errorCode(cleanupError) !== 'ENOENT')
                throw cleanupError;
        }
        throw error;
    }
}
function documentDirectory(root, documentId) {
    const directory = resolve(root, documentId);
    assertContained(root, directory);
    return directory;
}
/** Validate persisted metadata before it supplies a document identity or format. */
function parseRecord(value, documentId) {
    if (typeof value !== 'object' || value === null || !('schemaVersion' in value) || value.schemaVersion !== 1) {
        throw new Error('不支持的文档元数据版本');
    }
    const { schemaVersion: _version, ...fields } = value;
    const summary = documentSummarySchema.parse(fields);
    if (summary.documentId !== documentId)
        throw new Error('文档元数据标识与目录不一致');
    return { schemaVersion: 1, ...summary };
}
/** Validate and persist one imported text document under the private library. */
export class DocumentStore {
    root;
    /** @param root - private document library root. */
    constructor(root = DOCUMENT_ROOT) {
        this.root = root;
    }
    /**
     * Persist one imported document and its normalized UTF-8 text.
     * @param input - validated title, format, and content from the import boundary.
     * @returns the durable document summary.
     */
    async import(input) {
        const summary = documentSummarySchema.parse({
            documentId: randomUUID(),
            title: input.title,
            format: input.format,
            size: Buffer.byteLength(input.content, 'utf8'),
            importedAt: Date.now(),
        });
        const directory = documentDirectory(this.root, summary.documentId);
        await mkdir(directory, { recursive: true, mode: 0o700 });
        await writeFile(resolve(directory, 'content.txt'), input.content, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        const record = { schemaVersion: 1, ...summary };
        try {
            await atomicWriteJson(resolve(directory, 'document.json'), record);
        }
        catch (error) {
            try {
                await unlink(resolve(directory, 'content.txt'));
            }
            catch (cleanupError) {
                if (errorCode(cleanupError) !== 'ENOENT')
                    throw cleanupError;
            }
            throw error;
        }
        return summary;
    }
    /**
     * Read one stored document record and its complete normalized text.
     * @param documentId - private document identity.
     * @returns the record and content pair.
     */
    async read(documentId) {
        const directory = documentDirectory(this.root, documentId);
        const record = parseRecord(JSON.parse(await readFile(resolve(directory, 'document.json'), 'utf8')), documentId);
        const content = await readFile(resolve(directory, 'content.txt'), 'utf8');
        if (record.size !== Buffer.byteLength(content, 'utf8'))
            throw new Error('文档内容与保存的长度不一致');
        return { record, content };
    }
    /** @returns all documents sorted by import time descending. */
    async list() {
        let names;
        try {
            names = await readdir(this.root);
        }
        catch (error) {
            if (errorCode(error) === 'ENOENT')
                return [];
            throw error;
        }
        const summaries = [];
        for (const name of names.sort()) {
            try {
                const record = parseRecord(JSON.parse(await readFile(resolve(documentDirectory(this.root, name), 'document.json'), 'utf8')), name);
                const { schemaVersion: _schemaVersion, ...summary } = record;
                summaries.push(documentSummarySchema.parse(summary));
            }
            catch (error) {
                if (errorCode(error) === 'ENOENT' || errorCode(error) === 'ENOTDIR')
                    continue;
                throw error;
            }
        }
        return summaries.sort((left, right) => right.importedAt - left.importedAt);
    }
    /**
     * Return one bounded Reader page.
     * @param documentId - private document identity.
     * @param pageIndex - zero-based page; omitted requests the first page. Out-of-range pages are rejected.
     * @returns a UTF-8-budgeted page and the total page count; Unicode code points are never split.
     */
    async get(documentId, pageIndex = 0) {
        const { record, content } = await this.read(documentId);
        const pages = documentPages(content);
        const selected = pages[pageIndex];
        if (selected === undefined)
            throw new Error('文档页码超出范围');
        return documentContentSchema.parse({
            documentId: record.documentId,
            title: record.title,
            format: record.format,
            content: selected,
            truncated: pageIndex < pages.length - 1,
            page: pageIndex,
            pageCount: pages.length,
        });
    }
}
