import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const libDir = join(packageRoot, 'lib')
for (const entry of await readdir(libDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue
  const path = join(libDir, entry.name)
  const source = await readFile(path, 'utf8')
  const normalized = source.replace(/[\t ]+$/gmu, '')
  if (normalized !== source) await writeFile(path, normalized)
}
