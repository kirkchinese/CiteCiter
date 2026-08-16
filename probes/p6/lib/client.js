/**
 * Probe P6. Question: can the details panel render rich media — KaTeX math
 * through ui-primitives MarkdownText, an inline SVG element, and fenced
 * code blocks — from a plugin component? Probe-only window hook.
 */
window.__ModuleLoader__.load({
  id: 'citeciter-probe-p6',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const jsx = require('react/jsx-runtime').jsx
    const MarkdownText = require('@deepseek-ai/dsh-client-ui-primitives').MarkdownText

    exports.inject = ['layout', 'sessions']

    exports.apply = function apply(ctx) {
      ctx.slots.inject('details', () => ctx.slots.register({
        name: 'details',
        priority: -1,
      }, function RichMediaPanel() {
        return jsx('div', { 'data-citeciter-probe': 'p6-panel', style: { padding: 16 } }, [
          jsx(MarkdownText, {
            key: 'md',
            text: '数学公式 $E=mc^2$ 与代码：\n```js\nconsole.log("demo")\n```\n',
          }),
          jsx('svg', {
            key: 'svg',
            'data-citeciter-probe': 'p6-svg',
            width: 120, height: 40, viewBox: '0 0 120 40',
          }, jsx('circle', { cx: 20, cy: 20, r: 14, fill: 'var(--dsw-static-deepseek-500, #4d6bfe)' })),
        ])
      }))

      window.__citeciterProbeP6 = {
        layout: ctx.layout,
        sessions: ctx.sessions,
      }
    }
    return module.exports
  },
})
