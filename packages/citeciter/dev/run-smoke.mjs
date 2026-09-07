/** Boot a disposable real DSH profile and compare its keyless Topic transcript. */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const dshHome = await mkdtemp(join(tmpdir(), 'citeciter-dsh-rc1-'))
const shimName = process.platform === 'win32' ? 'dsh.cmd' : 'dsh'
const shim = (process.env.PATH ?? '').split(delimiter).map(dir => join(dir, shimName)).find(existsSync)
if (!shim) throw new Error('Install @deepseek-ai/dsh@0.1.2-rc.1 before running this smoke')
const bin = process.platform === 'win32'
  ? join(dirname(shim), 'node_modules/@deepseek-ai/dsh/lib/bin.js')
  : await realpath(shim)
const environment = { ...process.env, DSH_HOME: dshHome }

async function command(args) {
  const child = spawn(process.execPath, [bin, ...args], { env: environment, stdio: 'inherit', windowsHide: true })
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
  if (code !== 0) throw new Error(`DSH command failed (${code})`)
}

await command(['plugin', '--profile', 'web', 'add', process.argv[2] ? resolve(process.argv[2]) : packageRoot])
const fixture = name => JSON.stringify(pathToFileURL(join(packageRoot, 'dev', name)).href)
await writeFile(join(dshHome, 'profiles/web/cordis.patch.yml'), `- insert:
    - id: citeciter-fixture-llm
      name: ${fixture('fake-llm.mjs')}
    - id: citeciter-assembled-smoke
      name: ${fixture('assembled-smoke.mjs')}
`)
await mkdir(new URL('../tests/snapshots/', import.meta.url), { recursive: true })
async function bootAndVerify(file, extraEnvironment = {}) {
const child = spawn(process.execPath, [bin, '--profile', 'web', '--host', '127.0.0.1', '--port', '0', '--no-open'], {
  cwd: packageRoot, env: { ...environment, ...extraEnvironment }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
const exited = new Promise(resolve => child.once('close', resolve))
let diagnostics = ''
child.stdout.on('data', bytes => { diagnostics += bytes })
child.stderr.on('data', bytes => { diagnostics += bytes })
const launchError = new Promise((_, reject) => child.once('error', reject))
try {
  const result = await Promise.race([launchError, (async () => {
    const deadline = Date.now() + 180_000
    while (Date.now() < deadline) {
      try { return JSON.parse(await readFile(join(dshHome, file), 'utf8')) }
      catch (error) { if (error.code !== 'ENOENT') throw error }
      if (child.exitCode !== null) throw new Error(`DSH exited (${child.exitCode}): ${diagnostics}`)
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    throw new Error(`DSH smoke timed out: ${diagnostics}`)
  })()])
  if (!result.ok) throw new Error(JSON.stringify(result, null, 2))
} finally {
  child.kill()
  await exited
}
}
await bootAndVerify('assembled-smoke.json')
await bootAndVerify('restored-smoke.json', { CITECITER_VERIFY_RESTORE: '1' })
console.log(`Keyless Observer / Exact Fork / five-stage learning / board / cards / restart snapshot passed. Artifacts: ${dshHome}`)
