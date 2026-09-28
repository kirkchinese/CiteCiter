import { actionTarget, type CiteAction, type ActionModel, type PanelPresentation } from '../actions.ts'
import { actionSourceSession, type ActionSource } from './action-controller.ts'
import type { CompanionFace } from './companion-controller.ts'
import type { ReaderFace } from './reader-controller.ts'
import { selectionReferences } from './selection-references.ts'

/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export function createActionExecutor(companion: CompanionFace, reader: ReaderFace, open: (presentation: PanelPresentation) => void) {
  const imports = new WeakMap<ActionSource, string>()
  return async (source: ActionSource, action: CiteAction, question: string, modelRoute?: ActionModel): Promise<void> => {
    const sourceId = actionSourceSession(source)
    const assertSource = () => {
      if (companion.getSnapshot().sourceSessionId !== sourceId) throw new Error('来源会话已切换，请返回原文件或重新选文')
    }
    assertSource()
    open(action.presentation)
    const target = actionTarget(action) === 'current' ? await companion.resolveDraftTopic(sourceId) : null
    assertSource()
    if (source.kind === 'conversation') {
      if (target !== null) companion.appendSelection(sourceId, target, question, selectionReferences(source))
      else {
        await companion.create(source.selection, question, undefined, action.scenario, modelRoute)
        if (companion.getSnapshot().phase === 'error') throw new Error(companion.getSnapshot().error ?? '创建失败')
      }
      assertSource()
      return
    }
    let documentId = source.documentId ?? imports.get(source)
    if (documentId === undefined) {
      if (source.content === undefined) throw new Error('文件快照不可用，请重新选择')
      const imported = await reader.importFile(source.title.slice(0, 200), source.content)
      if (imported === null) throw new Error(reader.getSnapshot().error ?? '无法保存文件快照')
      documentId = imported.documentId
      imports.set(source, documentId)
    }
    assertSource()
    if (target !== null) companion.appendSelection(sourceId, target, question, selectionReferences(source, documentId))
    else await companion.createFromDocument({ documentId, displayText: source.displayText, prefixText: source.prefixText, suffixText: source.suffixText }, question, sourceId, modelRoute)
    assertSource()
    reader.setOpen(false)
  }
}
