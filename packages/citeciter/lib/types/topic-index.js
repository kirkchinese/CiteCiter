/** Durable navigation metadata and bounded legacy artifact cleanup, independent of Agent execution. */
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, realpath, readFile, readdir, rename, rmdir, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { dshHomePath } from '@deepseek-ai/dsh-home-paths';
import { z } from 'zod';
import { topicMetadataSchema, parseTopicMetadataFile } from "./topic.js";
const TOPIC_INDEX_ROOT = dshHomePath('citeciter', 'workspaces');
export function errorCode(error) {
    return typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : undefined;
}
export async function unlinkIfPresent(path) {
    try {
        await unlink(path);
    }
    catch (error) {
        if (errorCode(error) !== 'ENOENT')
            throw error;
    }
}
export async function rmdirIfEmpty(path) {
    try {
        await rmdir(path);
    }
    catch (error) {
        if (errorCode(error) !== 'ENOENT' && errorCode(error) !== 'ENOTEMPTY')
            throw error;
    }
}
function sourceDirectoryName(sourceSessionId) {
    return Buffer.from(sourceSessionId, 'utf8').toString('base64url');
}
function assertContained(root, target) {
    const path = relative(resolve(root), resolve(target));
    if (path === '' || path.startsWith('..') || isAbsolute(path)) {
        throw new Error('CiteCiter refused a path outside its private storage root');
    }
}
/** Require an existing target's real parent to remain below the configured private root. */
async function assertCanonicalParent(root, target) {
    assertContained(root, target);
    const [canonicalRoot, canonicalParent] = await Promise.all([realpath(root), realpath(dirname(target))]);
    assertContained(canonicalRoot, resolve(canonicalParent, basename(target)));
}
/** Remove one owned file or final link without following links in its parent path. */
async function unlinkOwnedFileIfPresent(root, target) {
    const info = await lstat(target).catch((error) => {
        if (errorCode(error) === 'ENOENT')
            return undefined;
        throw error;
    });
    if (info === undefined)
        return;
    await assertCanonicalParent(root, target);
    if (!info.isFile() && !info.isSymbolicLink()) {
        throw new Error(`CiteCiter refused to unlink a non-file storage artifact: ${target}`);
    }
    await unlink(target);
}
/** Remove one empty owned directory after proving it is a real directory below root. */
async function rmdirOwnedIfEmpty(root, target) {
    const info = await lstat(target).catch((error) => {
        if (errorCode(error) === 'ENOENT')
            return undefined;
        throw error;
    });
    if (info === undefined)
        return;
    if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error(`CiteCiter refused to remove a link-shaped or non-directory storage path: ${target}`);
    }
    const [canonicalRoot, canonicalTarget] = await Promise.all([realpath(root), realpath(target)]);
    assertContained(canonicalRoot, canonicalTarget);
    await rmdirIfEmpty(target);
}
/**
 * Remove one artifact from a caller-owned JSONL root without following links.
 * @param root - fixed private JSONL root owned by the caller.
 * @param artifact - location returned by that exact JSONL backend.
 * @returns when the file/link and its empty per-session directory are absent.
 */
export async function removeOwnedJsonlArtifact(root, artifact) {
    if (artifact === undefined || artifact.kind !== 'jsonl') {
        throw new Error('CiteCiter permanent deletion requires its private JSONL artifact backend');
    }
    await unlinkOwnedFileIfPresent(root, artifact.path);
    await rmdirOwnedIfEmpty(root, dirname(artifact.path));
}
/**
 * Delete all JSONL generations of an already retired private Topic.
 * DSH 0.1.5 has no public delete/location API. This bounded disk adapter follows
 * its project/Session directory layout and canonical generation filenames.
 * @param root - exclusively owned CiteCiter Session root, never a host Session root.
 * @param sessionId - generated CiteCiter identity; arbitrary path segments are refused.
 * @returns after every canonical generation and the retired lock file are absent.
 */
export async function removeOwnedTopicGenerations(root, sessionId) {
    if (!/^citeciter-[a-zA-Z0-9-]+$/u.test(sessionId))
        throw new Error('Invalid private Topic identity for deletion');
    const projects = await readdir(root, { withFileTypes: true }).catch((error) => {
        if (errorCode(error) === 'ENOENT')
            return [];
        throw error;
    });
    for (const project of projects) {
        if (!project.isDirectory() || project.isSymbolicLink())
            continue;
        const directory = resolve(root, project.name, sessionId);
        const info = await lstat(directory).catch((error) => {
            if (errorCode(error) === 'ENOENT')
                return undefined;
            throw error;
        });
        if (info === undefined)
            continue;
        if (!info.isDirectory() || info.isSymbolicLink())
            throw new Error('Refused linked Topic directory');
        assertContained(await realpath(root), await realpath(directory));
        for (const name of await readdir(directory)) {
            if (/^session(?:\.v[1-9]\d*)?\.jsonl(?:\.zstd)?$/u.test(name) || name === 'session.lock') {
                await unlinkOwnedFileIfPresent(root, resolve(directory, name));
            }
        }
        await rmdirOwnedIfEmpty(root, directory);
    }
}
async function atomicWriteJson(path, value) {
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
        await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        await rename(temp, path);
    }
    catch (error) {
        await unlinkIfPresent(temp);
        throw error;
    }
}
const topicDeletionMarkerSchema = z.object({
    schemaVersion: z.literal(1),
    storage: z.literal('source').optional(),
    sessionId: z.string().min(1),
    sourceSessionId: z.string().min(1),
    topicId: z.number().int().positive(),
    sessionHeader: z.object({
        version: z.number().int().nonnegative(),
        id: z.string().min(1),
        createdAt: z.number().int().nonnegative(),
        isSeeded: z.boolean().default(false),
        cwd: z.string().optional(),
    }).strict(),
}).strict();
function parseTopicDeletionMarker(raw) {
    return topicDeletionMarkerSchema.parse(raw);
}
/** Minimal on-disk navigation index; Session history stays in standard DSH JSONL. */
export class TopicIndex {
    root;
    sourceRoots = new Map();
    /** Bind a canonical source-owned root resolved by SourceStorage. */
    bindSource(sourceSessionId, root) { this.sourceRoots.set(sourceSessionId, root); }
    /** Return the owned metadata directory for one source-backed Topic. */
    ownedDirectory(sourceSessionId, topicId) {
        const root = this.sourceRoots.get(sourceSessionId);
        if (root === undefined)
            throw new Error('Citer 来源目录不可用');
        const directory = resolve(root, String(topicId));
        assertContained(root, directory);
        return directory;
    }
    /** @param root - private Topic index root. */
    constructor(root = TOPIC_INDEX_ROOT) {
        this.root = root;
    }
    /** Read navigation records across sources; never opens or mutates a Session log. */
    async all(includeSuperseded = false) {
        const sources = await readdir(this.root, { withFileTypes: true }).catch((error) => {
            if (errorCode(error) === 'ENOENT')
                return [];
            throw error;
        });
        const records = [];
        for (const source of sources) {
            if (!source.isDirectory() || source.isSymbolicLink())
                continue;
            const directory = resolve(this.root, source.name);
            for (const item of await readdir(directory, { withFileTypes: true })) {
                if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name))
                    continue;
                const path = resolve(directory, item.name);
                if (await this.deletionMarkerIfPresent(path) !== undefined)
                    continue;
                const record = await this.readIfPresent(resolve(path, 'topic.json'));
                if (record !== undefined)
                    records.push(record);
            }
        }
        for (const [sourceSessionId, directory] of this.sourceRoots) {
            for (const item of await readdir(directory, { withFileTypes: true })) {
                if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name))
                    continue;
                const path = resolve(directory, item.name);
                if (await this.deletionMarkerIfPresent(path) !== undefined)
                    continue;
                const record = await this.readIfPresent(resolve(path, 'topic.json'));
                if (record !== undefined && record.sourceSessionId === sourceSessionId && record.storage === 'source')
                    records.push(record);
            }
        }
        if (includeSuperseded)
            return records;
        const unique = new Map();
        for (const record of records)
            if (!unique.has(record.sessionId) || record.storage === 'source')
                unique.set(record.sessionId, record);
        return [...unique.values()];
    }
    async reserve(sourceSessionId) {
        const sourceDirectory = this.sourceRoots.get(sourceSessionId) ?? resolve(this.root, sourceDirectoryName(sourceSessionId));
        await mkdir(sourceDirectory, { recursive: true, mode: 0o700 });
        let topicId = Math.max(0, ...(await this.list(sourceSessionId)).map(item => item.topicId)) + 1;
        try {
            const names = await readdir(sourceDirectory);
            topicId = Math.max(topicId - 1, ...names.map((name) => /^\d+$/.test(name) ? Number(name) : 0)) + 1;
        }
        catch (error) {
            if (errorCode(error) !== 'ENOENT')
                throw error;
        }
        while (true) {
            const directory = resolve(sourceDirectory, String(topicId));
            assertContained(sourceDirectory, directory);
            try {
                await mkdir(directory, { mode: 0o700 });
                return { topicId, directory };
            }
            catch (error) {
                if (errorCode(error) !== 'EEXIST')
                    throw error;
                topicId++;
            }
        }
    }
    async save(metadata) {
        const validated = topicMetadataSchema.parse(metadata);
        const directory = this.directory(validated.sourceSessionId, validated.topicId, validated.storage === 'source');
        await mkdir(directory, { recursive: true, mode: 0o700 });
        if ((await lstat(directory)).isSymbolicLink())
            throw new Error('Citer 拒绝写入链接形式的 Topic 目录');
        await assertCanonicalParent(validated.storage === 'source' ? this.sourceRoots.get(validated.sourceSessionId) : this.root, resolve(directory, 'topic.json'));
        await atomicWriteJson(resolve(directory, 'topic.json'), validated);
    }
    async loadBySessionId(sessionId) {
        const metadata = (await this.all()).find(item => item.sessionId === sessionId);
        if (metadata !== undefined)
            return metadata;
        throw new Error(`CiteCiter Topic "${sessionId}" does not exist`);
    }
    async list(sourceSessionId) {
        return (await this.all()).filter(item => item.sourceSessionId === sourceSessionId).sort((a, b) => a.topicId - b.topicId);
    }
    /** Commit a minimal deletion marker before making Topic metadata unreachable. */
    async markDeleting(metadata, sessionHeader) {
        const directory = this.directory(metadata.sourceSessionId, metadata.topicId, metadata.storage === 'source');
        const marker = {
            schemaVersion: 1,
            ...(metadata.storage === 'source' ? { storage: 'source' } : {}),
            sessionId: metadata.sessionId,
            sourceSessionId: metadata.sourceSessionId,
            topicId: metadata.topicId,
            sessionHeader: {
                version: sessionHeader.version,
                id: sessionHeader.id,
                createdAt: sessionHeader.createdAt,
                isSeeded: sessionHeader.isSeeded,
                ...(sessionHeader.cwd === undefined ? {} : { cwd: sessionHeader.cwd }),
            },
        };
        const markerPath = resolve(directory, 'deleting.json');
        await assertCanonicalParent(metadata.storage === 'source' ? this.sourceRoots.get(metadata.sourceSessionId) : this.root, markerPath);
        await atomicWriteJson(markerPath, marker);
        return marker;
    }
    /** Discover committed deletion markers without following linked directories. */
    async listDeleting() {
        const sources = await readdir(this.root, { withFileTypes: true }).catch(error => {
            if (errorCode(error) === 'ENOENT')
                return [];
            throw error;
        });
        const markers = [];
        const directories = sources.filter(source => source.isDirectory() && !source.isSymbolicLink()).map(source => ({ path: resolve(this.root, source.name), source: undefined }));
        directories.push(...[...this.sourceRoots].map(([source, path]) => ({ source, path })));
        for (const { path: sourceDirectory, source } of directories) {
            const topics = await readdir(sourceDirectory, { withFileTypes: true }).catch((error) => {
                if (errorCode(error) === 'ENOENT')
                    return [];
                throw error;
            });
            for (const topic of topics) {
                if (!topic.isDirectory() || topic.isSymbolicLink() || !/^\d+$/.test(topic.name))
                    continue;
                const marker = await this.deletionMarkerIfPresent(resolve(sourceDirectory, topic.name));
                if (marker !== undefined && marker.topicId === Number(topic.name) && (source === undefined ? marker.storage === undefined : marker.storage === 'source' && marker.sourceSessionId === source))
                    markers.push(marker);
            }
        }
        return markers;
    }
    /** Remove the marker and its now-empty Topic directory after artifact cleanup. */
    async finishDeleting(marker) {
        const owned = marker.storage === 'source';
        const directory = this.directory(marker.sourceSessionId, marker.topicId, owned);
        const root = owned ? this.sourceRoots.get(marker.sourceSessionId) : this.root;
        await unlinkOwnedFileIfPresent(root, resolve(directory, 'topic.json'));
        await unlinkOwnedFileIfPresent(root, resolve(directory, 'deleting.json'));
        await rmdirOwnedIfEmpty(root, directory);
    }
    /** Forget only a superseded plugin index after an owned copy was committed; original logs remain intact. */
    async forgetLegacy(metadata) {
        const directory = this.directory(metadata.sourceSessionId, metadata.topicId);
        const previous = await this.readIfPresent(resolve(directory, 'topic.json'));
        if (previous === undefined)
            return;
        if (previous.sessionId !== metadata.sessionId || previous.sourceSessionId !== metadata.sourceSessionId)
            throw new Error('Citer 旧索引与迁移身份不匹配，未删除');
        await unlinkOwnedFileIfPresent(this.root, resolve(directory, 'topic.json'));
        await rmdirOwnedIfEmpty(this.root, directory);
    }
    directory(sourceSessionId, topicId, owned = false) {
        if (owned)
            return this.ownedDirectory(sourceSessionId, topicId);
        const directory = resolve(this.root, sourceDirectoryName(sourceSessionId), String(topicId));
        assertContained(this.root, directory);
        return directory;
    }
    async read(path) {
        return parseTopicMetadataFile(JSON.parse(await readFile(path, 'utf8')));
    }
    async readIfPresent(path) {
        try {
            return await this.read(path);
        }
        catch (error) {
            if (errorCode(error) === 'ENOENT')
                return undefined;
            throw error;
        }
    }
    async deletionMarkerIfPresent(directory) {
        try {
            return parseTopicDeletionMarker(JSON.parse(await readFile(resolve(directory, 'deleting.json'), 'utf8')));
        }
        catch (error) {
            if (errorCode(error) === 'ENOENT')
                return undefined;
            throw error;
        }
    }
}
