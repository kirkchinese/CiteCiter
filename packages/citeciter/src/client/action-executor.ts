import { t } from './i18n.ts'
import { actionDelivery, type CiteAction, type ActionModel, type PanelPresentation } from '../actions.ts'
import { actionSourceSession, type ActionSource } from './action-controller.ts'
import type { CompanionFace } from './companion-controller.ts'
import type { ReaderFace } from './reader-controller.ts'
import { selectionReferences } from './selection-references.ts'

/** Where a chosen action goes: the selected Topic by default, or a new Topic when the user asks for one. */
export interface ActionRunOptions {
  readonly newTopic?: boolean
}

/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export function createActionExecutor(companion: CompanionFace, reader: ReaderFace, open: (presentation: PanelPresentation) => void) {
  const imports = new WeakMap<ActionSource, string>()
  const importDocument = async (source: Extract<ActionSource, { kind: 'document' }>): Promise<string> => {
    const cached = source.documentId ?? imports.get(source)
    if (cached !== undefined) return cached
    if (source.content === undefined) throw new Error(t('settings.error.snapshotUnavailable'))
    const imported = await reader.importFile(source.title.slice(0, 200), source.content)
    if (imported === null) throw new Error(reader.getSnapshot().error ?? t('settings.error.saveSnapshot'))
    imports.set(source, imported.documentId)
    return imported.documentId
  }
  const run = async (source: ActionSource, action: CiteAction, question: string, modelRoute?: ActionModel, options: ActionRunOptions = {}): Promise<void> => {
    const sourceId = actionSourceSession(source)
    const assertSource = () => {
      if (companion.getSnapshot().sourceSessionId !== sourceId) throw new Error(t('settings.error.sourceFileChanged'))
    }
    assertSource()
    open(action.presentation)
    const delivery = actionDelivery(action, companion.getSnapshot().settings.actionDelivery)
    // Keep Topics current for this action only; showing a toolbar never reopens the panel.
    const releaseVisible = companion.retainVisible()
    let target: string | null
    try {
      await companion.settle()
      target = source.kind === 'topic' ? source.topicSessionId : options.newTopic === true ? null : await companion.resolveDraftTopic(sourceId)
    } finally { releaseVisible() }
    assertSource()
    if (source.kind === 'topic') {
      await companion.appendSelection(sourceId, source.topicSessionId, question, selectionReferences(source), delivery)
      return
    }
    if (source.kind === 'conversation' || source.kind === 'quote') {
      if (target !== null) await companion.appendSelection(sourceId, target, question, selectionReferences(source), delivery)
      else if (source.kind === 'conversation') {
        await companion.create(source.selection, question, modelRoute, delivery)
        if (companion.getSnapshot().phase === 'error' && companion.getSnapshot().active === null) throw new Error(companion.getSnapshot().error ?? t('settings.error.create'))
      } else {
        if (!await companion.createFree('')) throw new Error(companion.getSnapshot().error ?? t('settings.error.create'))
        const topicId = companion.getSnapshot().active?.topic.sessionId
        if (topicId === undefined) throw new Error(t('settings.error.topicNotReady'))
        await companion.appendSelection(sourceId, topicId, question, selectionReferences(source), delivery)
      }
      assertSource()
      return
    }
    const documentId = await importDocument(source)
    assertSource()
    if (target !== null) await companion.appendSelection(sourceId, target, question, selectionReferences(source, documentId), delivery)
    else await companion.createFromDocument({ documentId, displayText: source.displayText, prefixText: source.prefixText, suffixText: source.suffixText }, question, sourceId, modelRoute, delivery)
    assertSource()
    reader.setOpen(false)
  }
  const quote = async (source: ActionSource): Promise<void> => {
    const sourceId = actionSourceSession(source)
    const assertSource = () => {
      if (companion.getSnapshot().sourceSessionId !== sourceId) throw new Error(t('settings.error.sourceChanged'))
    }
    assertSource()
    open('side')
    const releaseVisible = companion.retainVisible()
    let target: string | null
    try {
      await companion.settle()
      target = source.kind === 'topic' ? source.topicSessionId : await companion.resolveDraftTopic(sourceId)
    } finally { releaseVisible() }
    assertSource()
    if (source.kind === 'topic') {
      await companion.appendSelection(sourceId, source.topicSessionId, '', selectionReferences(source))
    } else if (target !== null) {
      const documentId = source.kind === 'document' ? await importDocument(source) : undefined
      assertSource()
      await companion.appendSelection(sourceId, target, '', selectionReferences(source, documentId))
    } else if (source.kind === 'conversation') {
      await companion.create(source.selection, '')
      if (companion.getSnapshot().phase === 'error' && companion.getSnapshot().active === null) throw new Error(companion.getSnapshot().error ?? t('settings.error.create'))
    } else if (source.kind === 'document') {
      const documentId = await importDocument(source)
      assertSource()
      await companion.createFromDocument({ documentId, displayText: source.displayText, prefixText: source.prefixText, suffixText: source.suffixText }, '', sourceId)
    } else {
      if (!await companion.createFree('')) throw new Error(companion.getSnapshot().error ?? t('settings.error.create'))
      const topicId = companion.getSnapshot().active?.topic.sessionId
      if (topicId === undefined) throw new Error(t('settings.error.topicNotReady'))
      await companion.appendSelection(sourceId, topicId, '', selectionReferences(source))
    }
    assertSource()
    if (source.kind === 'document') reader.setOpen(false)
  }
  return Object.assign(run, { quote })
}
