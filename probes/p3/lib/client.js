/**
 * Probe P3. Question: can a client plugin implement "selected text + right
 * click -> floating menu" using a document-level contextmenu listener and a
 * shell.overlay entry, keyed off the transcript DOM's documented flow data
 * attributes? Probe-only global state.
 */
window.__ModuleLoader__.load({
  id: 'citeciter-probe-p3',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')
    const jsx = require('react/jsx-runtime').jsx

    exports.inject = ['slots']

    let menu = null
    const listeners = new Set()

    function setMenu(next) {
      menu = next
      for (const fn of listeners) fn()
    }

    exports.apply = function apply(ctx) {
      ctx.effect(() => {
        const handler = (event) => {
          const sel = window.getSelection()
          if (sel === null || sel.isCollapsed || sel.rangeCount === 0) return
          const text = sel.toString().trim()
          if (text === '') return
          const range = sel.getRangeAt(0)
          const start = range.commonAncestorContainer
          const el = start.nodeType === 1 ? start : start.parentElement
          const flow = el?.closest('[data-chat-flow-kind]')
          if (flow === null || flow === undefined) return
          event.preventDefault()
          event.stopPropagation()
          setMenu({
            x: event.clientX,
            y: event.clientY,
            text,
            kind: flow.getAttribute('data-chat-flow-kind'),
            anchor: flow.getAttribute('data-chat-anchor-key'),
          })
        }
        document.addEventListener('contextmenu', handler)
        return () => document.removeEventListener('contextmenu', handler)
      })

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'citeciter-probe-p3',
        priority: -1,
      }, function SelectionMenu() {
        const [, force] = React.useState(0)
        React.useEffect(() => {
          const fn = () => force((n) => n + 1)
          listeners.add(fn)
          return () => listeners.delete(fn)
        }, [])
        if (menu === null) return null
        return jsx('div', {
          'data-citeciter-probe': 'p3-menu',
          'data-selected-kind': menu.kind,
          'data-selected-anchor': menu.anchor,
          style: {
            position: 'fixed', left: menu.x, top: menu.y, zIndex: 9999,
            background: '#111', color: '#fff', padding: 8, borderRadius: 6,
            pointerEvents: 'auto',
          },
        }, jsx('span', { 'data-citeciter-menu-label': 'text' }, `Citer! ${menu.text}`))
      }))
    }
    return module.exports
  },
})
