import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const packageBin = (name, command) => {
  const manifestPath = require.resolve(`${name}/package.json`)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  return join(dirname(manifestPath), typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[command])
}
const tsc = packageBin('typescript', 'tsc')
const tsdown = packageBin('tsdown', 'tsdown')
const watch = (args) => spawn(process.execPath, args, {
  cwd: new URL('..', import.meta.url), stdio: 'inherit', windowsHide: true,
})
const children = [
  watch([tsc, '-p', 'tsconfig.host.json', '--watch', '--preserveWatchOutput']),
  watch([tsc, '-p', 'tsconfig.client.json', '--watch', '--preserveWatchOutput']),
  watch([tsdown, '--watch', '--env.DSH_BUILD_FACE', 'client']),
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
