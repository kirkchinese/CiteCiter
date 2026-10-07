/** Compile both faces against the separately pinned Desktop SDK, without changing production resolution. */
import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const contract = resolve(root, '../citeciter-compat-desktop/package.json')
const require = createRequire(contract)
const manifest = JSON.parse(readFileSync(contract, 'utf8'))
const paths = {}
const visited = new Set()
function collect(name, parentRequire, optional = false) {
  if (visited.has(name) || !name.startsWith('@deepseek-ai/')) return
  let manifestPath
  try { manifestPath = realpathSync(parentRequire.resolve(`${name}/package.json`)) }
  catch (error) {
    // Optional host services are absent in a compile-only dependency closure.
    // Required packages and filesystem errors must still fail the gate.
    if (optional && error.code === 'MODULE_NOT_FOUND') return
    throw error
  }
  visited.add(name)
  const pkg = JSON.parse(readFileSync(manifestPath, 'utf8'))
  for (const [key, entry] of Object.entries(pkg.exports ?? {})) {
    const types = typeof entry === 'object' ? entry.types : undefined
    if (typeof types === 'string') paths[name + (key === '.' ? '' : key.slice(1))] = [resolve(dirname(manifestPath), types)]
  }
  const nested = createRequire(manifestPath)
  for (const dependency of Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })) {
    if (Object.hasOwn(manifest.devDependencies, dependency)) collect(dependency, require)
    else collect(dependency, nested, pkg.peerDependenciesMeta?.[dependency]?.optional === true)
  }
}
for (const name of Object.keys(manifest.devDependencies)) collect(name, require)
let failed = false
for (const face of ['host', 'client']) {
  const config = ts.readConfigFile(resolve(root, `tsconfig.${face}.json`), ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root, { paths, noEmit: true }, resolve(root, `tsconfig.${face}.json`))
  const program = ts.createProgram(parsed.fileNames, parsed.options)
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]
  if (diagnostics.length) {
    failed = true
    process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: path => path, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }))
  } else process.stdout.write(`Desktop ${face}: passed\n`)
}
process.exitCode = failed ? 1 : 0
