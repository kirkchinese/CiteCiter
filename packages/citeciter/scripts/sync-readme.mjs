/**
 * Generate the npm package READMEs from the repository READMEs.
 * README.md (Chinese) becomes README.zh.md and README.en.md becomes README.md, the
 * page npm displays. Relative links and images are rewritten to the release tag, so
 * the published page shows the files of the version it describes.
 * Run with --check in CI; without it, rewrite the package files.
 */
import { readFile, writeFile } from 'node:fs/promises'

const repository = 'https://github.com/kirkchinese/CiteCiter'
const raw = 'https://raw.githubusercontent.com/kirkchinese/CiteCiter'
const root = new URL('../../../', import.meta.url)
const pkg = new URL('../', import.meta.url)
const { version } = JSON.parse(await readFile(new URL('package.json', pkg), 'utf8'))
const ref = `v${version}`

const pages = [
  { from: 'README.md', to: 'README.zh.md', switch: { 'README.en.md': 'README.md' } },
  { from: 'README.en.md', to: 'README.md', switch: { 'README.md': 'README.zh.md' } },
]

const relative = target => !/^(?:[a-z][a-z0-9+.-]*:|#)/iu.test(target)

function rewrite(markdown, languageSwitch) {
  const images = markdown.replace(/(!\[[^\]]*\]\()([^)\s]+)\)/gu, (match, head, target) =>
    relative(target) ? `${head}${raw}/${ref}/${target})` : match)
  return images.replace(/(\]\()([^)\s]+)\)/gu, (match, head, target) => {
    if (!relative(target)) return match
    if (Object.hasOwn(languageSwitch, target)) return `${head}${languageSwitch[target]})`
    return `${head}${repository}/blob/${ref}/${target})`
  })
}

let stale = false
for (const page of pages) {
  const expected = rewrite(await readFile(new URL(page.from, root), 'utf8'), page.switch)
  const target = new URL(page.to, pkg)
  if (process.argv.includes('--check')) {
    const current = await readFile(target, 'utf8').catch(() => '')
    if (current !== expected) {
      console.error(`packages/citeciter/${page.to} is out of date. Run pnpm sync:readme.`)
      stale = true
    }
  } else {
    await writeFile(target, expected)
    console.log(`Wrote packages/citeciter/${page.to} from ${page.from}.`)
  }
}
if (stale) process.exitCode = 1
