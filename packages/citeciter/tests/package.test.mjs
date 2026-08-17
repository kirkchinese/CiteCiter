import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const packageRoot = new URL('../', import.meta.url)

test('published package declares an installable DSH bundle', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'))
  const patch = await readFile(new URL('cordis.patch.yml', packageRoot), 'utf8')

  assert.equal(manifest.name, '@kirkchinese/dsh-citeciter')
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.ok(manifest.files.includes('cordis.patch.yml'))
  assert.equal(patch, "- insert:\n    - id: citeciter\n      name: '@kirkchinese/dsh-citeciter'\n")
})
