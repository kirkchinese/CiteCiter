/**
 * Probe P1 client bundle (hand-written in the deployed module-loader format).
 * Question: is an external local package served under /plugins and listed in
 * window.__DSH_BOOT__? Renders one marker into the additive shell.overlay seat.
 */
window.__ModuleLoader__.load({
  id: 'citeciter-probe-p1',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const jsxRuntime = require('react/jsx-runtime')
    const jsx = jsxRuntime.jsx
    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay',
        id: 'citeciter-probe-p1',
        priority: -1,
      }, function ProbeOverlay() {
        return jsx('div', {
          'data-citeciter-probe': 'p1-overlay',
          style: { position: 'fixed', left: 8, bottom: 8, zIndex: 9999 },
        }, 'P1 overlay OK')
      }))
    }
    return module.exports
  },
})
