import { readdir, rm } from 'node:fs/promises'

const output = new URL('../lib/', import.meta.url)
for (const entry of await readdir(output, { withFileTypes: true })) {
  if (!entry.isFile()) continue
  if (entry.name.endsWith('.js') || entry.name.endsWith('.js.map') || entry.name === 'style.css') {
    await rm(new URL(entry.name, output))
  }
}
