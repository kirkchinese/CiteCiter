import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-commands'
import type {} from '@deepseek-ai/dsh-permission-presets'
import type {} from '@deepseek-ai/dsh-sandbox-policy'

export type ReadOnlyCommandStatus =
  | { readonly kind: 'pending' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'error', readonly message: string }

/** Fold the latest child-owned permission lifecycle and current sandbox state. */
export function readOnlyCommandStatus(agent: Agent): ReadOnlyCommandStatus {
  const events = agent.session.events
  const seedLength = agent.session.header.seedLength ?? 0
  const childEvents = events.slice(seedLength)
  const latestPreset = childEvents.findLast((event) => event.type === 'permission/preset')
  const latestSandbox = childEvents.findLast((event) => event.type === 'sandbox/mode')
  const currentPreset = latestPreset?.type === 'permission/preset'
    ? latestPreset.data.preset
    : undefined
  const currentSandbox = latestSandbox?.type === 'sandbox/mode'
    ? latestSandbox.data.mode
    : undefined

  for (let index = events.length - 1; index >= seedLength; index--) {
    const run = events[index]
    if (run?.type !== 'command/run' || run.data.name !== 'permission') continue
    // A later write-capable switch keeps the fold pending until the newly
    // admitted `/permission read-only` command reaches the durable log.
    if (run.data.args?.trim() !== 'read-only') return { kind: 'pending' }

    const done = events.slice(index + 1).find((event) => (
      event.type === 'command/done' && event.data.commandId === run.data.commandId
    ))
    if (done?.type !== 'command/done') return { kind: 'pending' }
    if (done.data.kind !== 'success') {
      return {
        kind: 'error',
        message: done.data.text ?? 'permission command failed without an outcome message',
      }
    }
    // Reapplying the same preset is an idempotent command: DSH logs run/done
    // but emits no duplicate preset or sandbox events. The effective child-
    // owned state is therefore the durable proof for second and later turns.
    if (currentPreset === 'read-only' && currentSandbox === 'read-only') {
      return { kind: 'ready' }
    }
    const presetApplied = events.slice(index + 1, done.seq).some((event) => (
      event.type === 'permission/preset' && event.data.preset === 'read-only'
    ))
    return presetApplied
      ? { kind: 'pending' }
      : { kind: 'error', message: 'permission command succeeded without applying read-only' }
  }
  return { kind: 'pending' }
}

/** Wait for durable command settlement instead of treating admission as success. */
export async function requireReadOnlyCommand(agent: Agent, timeoutMs = 15_000): Promise<void> {
  const initial = readOnlyCommandStatus(agent)
  if (initial.kind === 'ready') return
  if (initial.kind === 'error') throw new Error(`read-only switch failed: ${initial.message}`)

  await new Promise<void>((resolve, reject) => {
    let settled = false
    let dispose = () => {}
    const timer = setTimeout(() => {
      finish(new Error('read-only switch timed out before durable command settlement'))
    }, timeoutMs)
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      dispose()
      if (error === undefined) resolve()
      else reject(error)
    }
    const check = () => {
      const status = readOnlyCommandStatus(agent)
      if (status.kind === 'ready') finish()
      else if (status.kind === 'error') finish(new Error(`read-only switch failed: ${status.message}`))
    }
    dispose = agent.ctx.on('session/event', (session) => {
      if (session.id === agent.session.id) check()
    })
    // Close the listener-install race: settlement may have arrived after the
    // first fold and before `session/event` registration.
    check()
  })
}
