/** CiteCiter-owned accelerator parsing and listener installation. */

const MODIFIER_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta'])

export interface Accelerator {
  readonly modifiers: ReadonlySet<'Control' | 'Alt' | 'Shift' | 'Meta'>
  readonly key: string
}

/**
 * Parse a `Modifier+Modifier+Key` accelerator string.
 * @param accelerator - user-configured accelerator, e.g. `Control+Shift+C`.
 * @returns normalized modifiers and the final key, or null when malformed.
 */
export function parseAccelerator(accelerator: string): Accelerator | null {
  const parts = accelerator.split('+').map((part) => part.trim()).filter((part) => part !== '')
  if (parts.length < 2) return null
  const key = parts.pop()
  if (key === undefined || key.length === 0) return null
  const modifiers = new Set<'Control' | 'Alt' | 'Shift' | 'Meta'>()
  for (const part of parts) {
    if (!MODIFIER_KEYS.has(part)) return null
    modifiers.add(part as 'Control' | 'Alt' | 'Shift' | 'Meta')
  }
  if (modifiers.size === 0) return null
  return { modifiers, key }
}

/** Whether the event target is an editable surface that must keep every key. */
function targetIsEditable(target: EventTarget | null): boolean {
  if (target === null || typeof target !== 'object') return false
  const element = target as { closest?: unknown }
  if (typeof element.closest !== 'function') return false
  return (element.closest as (selector: string) => Element | null)('input, textarea, [contenteditable="true"]') !== null
}

/**
 * Install a window-level keydown listener that reads the accelerator fresh on
 * every keypress, so settings changes apply without re-registering.
 * @param accelerator - current accelerator getter; an empty value disables the binding.
 * @param handler - invoked once for each matching, non-editable, non-IME keypress.
 * @returns disposer removing the listener.
 */
export function installDynamicAccelerator(
  accelerator: () => string | undefined,
  handler: () => void,
): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    const configured = accelerator()
    if (configured === undefined || configured === '') return
    const parsed = parseAccelerator(configured)
    if (parsed === null) return
    if (event.isComposing || event.keyCode === 229) return
    if (targetIsEditable(event.target)) return
    if (event.ctrlKey !== parsed.modifiers.has('Control')) return
    if (event.altKey !== parsed.modifiers.has('Alt')) return
    if (event.shiftKey !== parsed.modifiers.has('Shift')) return
    if (event.metaKey !== parsed.modifiers.has('Meta')) return
    if (event.key.toLocaleLowerCase() !== parsed.key.toLocaleLowerCase()) return
    event.preventDefault()
    handler()
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
