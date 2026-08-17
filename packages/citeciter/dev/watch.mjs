import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = [
  spawn(npm, ['exec', '--', 'tsc', '-p', 'tsconfig.json', '--watch', '--preserveWatchOutput'], {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
  }),
  spawn(npm, ['exec', '--', 'tsdown', '--watch', '--env.DSH_BUILD_FACE', 'client'], {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
  }),
]

let stopping = false
let exitCode = 0

function stop(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal)
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stop(signal))
}

await Promise.all(children.map((child) => new Promise((resolve) => {
  child.once('error', (error) => {
    console.error(error)
    exitCode = 1
    stop()
    resolve()
  })
  child.once('exit', (code, signal) => {
    if (!stopping && (code !== 0 || signal !== null)) exitCode = code ?? 1
    if (!stopping) stop()
    resolve()
  })
})))

process.exitCode = exitCode
