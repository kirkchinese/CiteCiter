/** Probe P7: process-global Host inspect registry duplicate-id conflict. */
export const name = 'citeciter-probe-p7'
export const inject = ['cordisInspect']

function provider(id) {
  return {
    platform: 'host',
    manifest: {
      id,
      description: `${id} probe provider`,
      methods: [{
        name: 'ping',
        description: 'probe ping',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: { pong: { type: 'boolean' } } },
      }],
    },
    query: async () => ({ pong: true }),
  }
}

export async function apply(ctx) {
  const inspect = ctx.cordisInspect
  const result = { before: inspect.list().map((p) => p.id), first: null, second: null }
  let disposer
  try {
    disposer = inspect.register(provider('citeciter-probe-dup'))
    result.first = 'ok'
  } catch (error) {
    result.first = `throw: ${String(error?.message ?? error)}`
  }
  try {
    inspect.register(provider('citeciter-probe-dup'))
    result.second = 'ok (UNEXPECTED)'
  } catch (error) {
    result.second = `throw: ${String(error?.message ?? error)}`
  }
  if (disposer) disposer()
  result.afterDispose = inspect.list().map((p) => p.id).includes('citeciter-probe-dup')
  console.error('CITEciter_PROBE_P7_RESULT ' + JSON.stringify(result))
  setTimeout(() => process.exit(0), 200)
}
// Probe-only: end the process after results are printed.
