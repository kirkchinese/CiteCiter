/**
 * Probe P8. Question: does a static client plugin reach the official wire
 * client (ctx.connection.api) and create/read a session WITHOUT making it
 * current? Probe-only window hook.
 */
window.__ModuleLoader__.load({
  id: 'citeciter-probe-p8',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    exports.inject = ['connection', 'sessions']

    exports.apply = function apply(ctx) {
      window.__citeciterProbeP8 = {
        api: ctx.connection.api,
        sessions: ctx.sessions,
      }
    }
    return module.exports
  },
})
