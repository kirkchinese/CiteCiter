/**
 * Probe P2. Questions:
 *  1. Can a plugin dynamically register into the single `details` slot at
 *     priority -1 and have it win over the shipped priority-0 occupant?
 *  2. Does ctx.layout.openDetails() open the resizable right column and
 *     render the entry while a non-blank session is current?
 *  3. Does the returned disposer remove the entry again?
 * The probe deliberately exposes window.__citeciterProbeP2 — probe-only.
 */
window.__ModuleLoader__.load({
  id: 'citeciter-probe-p2',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const jsx = require('react/jsx-runtime').jsx

    exports.inject = ['layout', 'workspaces', 'sessions']

    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return

      slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay',
        id: 'citeciter-probe-p2',
        priority: -1,
      }, function ProbeOverlay() {
        return jsx('div', {
          'data-citeciter-probe': 'p2-overlay',
          style: { position: 'fixed', left: 8, bottom: 44, zIndex: 9999 },
        }, 'P2 overlay OK')
      }))

      let mountedDisposer = null

      window.__citeciterProbeP2 = {
        mountDetails() {
          if (mountedDisposer !== null) return { alreadyMounted: true }
          slots.inject('details', () => {
            mountedDisposer = slots.register({
              name: 'details',
              priority: -1,
            }, function ProbeDetailsPanel(props) {
              return jsx('div', {
                'data-citeciter-probe': 'p2-details',
                'data-session-id': props.sessionId ?? 'none',
              }, 'P2 details OK')
            })
          })
          return { requested: true }
        },
        disposeDetails() {
          const d = mountedDisposer
          mountedDisposer = null
          if (d === undefined || d === null) return { hadDisposer: false }
          d()
          return { disposed: true }
        },
        slotsInfo() {
          return slots.entriesOfSlot('details').map((entry) => ({
            priority: entry.options.priority ?? 0,
            registrant: entry.options.registrant ?? null,
          }))
        },
        layout: ctx.layout,
        workspaces: ctx.workspaces,
        sessions: ctx.sessions,
      }
    }
    return module.exports
  },
})
