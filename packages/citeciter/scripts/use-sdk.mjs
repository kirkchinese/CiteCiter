/**
 * Point the main SDK at another DSH release, for the scheduled compatibility check.
 * Usage: node scripts/use-sdk.mjs <version>
 * Rewrites every `@deepseek-ai/dsh*` devDependency to that version (the caller then runs
 * `pnpm sync:git-entry` and an unfrozen `pnpm install`) and reports whether the version is inside
 * the declared `engines.dsh` range, evaluated the way DSH's own plugin gate does (prereleases included).
 * Never commit the result: it is a probe, not a release change.
 */
import { readFile, writeFile } from 'node:fs/promises'
import semver from 'semver'

const version = process.argv[2]
if (version === undefined || semver.valid(version) === null) {
  console.error('Usage: node scripts/use-sdk.mjs <exact DSH version>')
  process.exit(2)
}
const url = new URL('../package.json', import.meta.url)
const manifest = JSON.parse(await readFile(url, 'utf8'))
const range = manifest.engines?.dsh
let changed = 0
for (const name of Object.keys(manifest.devDependencies)) {
  if (name === '@deepseek-ai/dsh' || name.startsWith('@deepseek-ai/dsh-')) {
    manifest.devDependencies[name] = version
    changed++
  }
}
await writeFile(url, `${JSON.stringify(manifest, null, 2)}\n`)
const declared = typeof range === 'string' && semver.satisfies(version, range, { includePrerelease: true })
console.log(`Main SDK set to DSH ${version} (${changed} packages). engines.dsh ${range}: ${declared ? 'inside' : 'outside'} the declared range.`)
// GitHub Actions reads this to label the result.
if (process.env.GITHUB_OUTPUT !== undefined) await writeFile(process.env.GITHUB_OUTPUT, `declared=${declared}\n`, { flag: 'a' })
