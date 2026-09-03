/** Private CiteCiter document library: durable text/Markdown sources for Reading Topics. */
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import {
  documentContentSchema,
  documentSummarySchema,
  type DocumentContent,
  type DocumentFormat,
  type DocumentSummary,
} from './topic.ts'

const DOCUMENT_ROOT = dshHomePath('citeciter', 'documents')
/** Reader page budget keeps one document-get response comfortably bounded. */
export const DOCUMENT_CONTENT_MAX_BYTES = 500 * 1024

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined
}

function assertContained(root: string, target: string): void {
  const path = relative(resolve(root), resolve(target))
  if (path === '' || path.startsWith('..') || isAbsolute(path)) {
    throw new Error('CiteCiter refused a path outside its private document root')
  }
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const temp = `${path}.${randomUUID()}.tmp`
  try {
    await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    await rename(temp, path)
  } catch (error) {
    try {
      await unlink(temp)
    } catch (cleanupError) {
      if (errorCode(cleanupError) !== 'ENOENT') throw cleanupError
    }
    throw error
  }
}

interface DocumentRecordFile {
  readonly schemaVersion: 1
  readonly documentId: string
  readonly title: string
  readonly format: DocumentFormat
  readonly size: number
  readonly importedAt: number
}

function documentDirectory(root: string, documentId: string): string {
  const directory = resolve(root, documentId)
  assertContained(root, directory)
  return directory
}

/** Validate and persist one imported text document under the private library. */
export class DocumentStore {
  /** @param root - private document library root. */
  constructor(private readonly root: string = DOCUMENT_ROOT) {}

  /**
   * Persist one imported document and its normalized UTF-8 text.
   * @param input - validated title, format, and content from the import boundary.
   * @returns the durable document summary.
   */
  async import(input: { readonly title: string, readonly format: DocumentFormat, readonly content: string }): Promise<DocumentSummary> {
    const summary = documentSummarySchema.parse({
      documentId: randomUUID(),
      title: input.title,
      format: input.format,
      size: Buffer.byteLength(input.content, 'utf8'),
      importedAt: Date.now(),
    }) as DocumentSummary
    const directory = documentDirectory(this.root, summary.documentId)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await writeFile(resolve(directory, 'content.txt'), input.content, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    const record: DocumentRecordFile = { schemaVersion: 1, ...summary }
    try {
      await atomicWriteJson(resolve(directory, 'document.json'), record)
    } catch (error) {
      try {
        await unlink(resolve(directory, 'content.txt'))
      } catch (cleanupError) {
        if (errorCode(cleanupError) !== 'ENOENT') throw cleanupError
      }
      throw error
    }
    return summary
  }

  /**
   * Read one stored document record and its complete normalized text.
   * @param documentId - private document identity.
   * @returns the record and content pair.
   */
  async read(documentId: string): Promise<{ readonly record: DocumentRecordFile, readonly content: string }> {
    const directory = documentDirectory(this.root, documentId)
    const record = JSON.parse(await readFile(resolve(directory, 'document.json'), 'utf8')) as DocumentRecordFile
    const content = await readFile(resolve(directory, 'content.txt'), 'utf8')
    return { record, content }
  }

  /** @returns all documents sorted by import time descending. */
  async list(): Promise<DocumentSummary[]> {
    let names: string[]
    try {
      names = await readdir(this.root)
    } catch (error) {
      if (errorCode(error) === 'ENOENT') return []
      throw error
    }
    const summaries: DocumentSummary[] = []
    for (const name of names.sort()) {
      try {
        const record = JSON.parse(await readFile(resolve(documentDirectory(this.root, name), 'document.json'), 'utf8')) as DocumentRecordFile
        const { schemaVersion: _schemaVersion, ...summary } = record
        summaries.push(documentSummarySchema.parse(summary) as DocumentSummary)
      } catch (error) {
        if (errorCode(error) === 'ENOENT' || errorCode(error) === 'ENOTDIR') continue
        throw error
      }
    }
    return summaries.sort((left, right) => right.importedAt - left.importedAt)
  }

  /**
   * Return one bounded Reader page.
   * @param documentId - private document identity.
   * @returns the first content window, truncated when the text exceeds the page budget.
   */
  async get(documentId: string): Promise<DocumentContent> {
    const { record, content } = await this.read(documentId)
    let page = ''
    let bytes = 0
    for (const character of content) {
      const characterBytes = Buffer.byteLength(character, 'utf8')
      if (bytes + characterBytes > DOCUMENT_CONTENT_MAX_BYTES) break
      page += character
      bytes += characterBytes
    }
    return documentContentSchema.parse({
      documentId: record.documentId,
      title: record.title,
      format: record.format,
      content: page,
      truncated: page.length < content.length,
    }) as DocumentContent
  }
}
