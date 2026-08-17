import { readFile, rename, rm, writeFile } from 'node:fs/promises'

const playwrightModule = process.env.PLAYWRIGHT_PATH ?? 'playwright'
const { chromium: chromiumExport } = await import(playwrightModule)

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const menuLabel = process.argv[3] ?? 'Citer!'
const bundlePath = new URL('../lib/client.js', import.meta.url)
const temporaryBundlePath = new URL(`../lib/.client.hmr-smoke-${process.pid}.tmp`, import.meta.url)
const originalBundle = await readFile(bundlePath)

async function replaceBundle(contents) {
  await writeFile(temporaryBundlePath, contents)
  await rename(temporaryBundlePath, bundlePath)
}
const browser = await chromiumExport.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
const errors = []
let bundleChanged = false
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.addInitScript(() => {
  const NativeEventSource = window.EventSource
  window.__citeciterHmrFrames = []
  window.EventSource = class extends NativeEventSource {
    constructor(...args) {
      super(...args)
      this.addEventListener('message', (event) => {
        window.__citeciterHmrFrames.push(event.data)
      })
    }
  }
})

function dispatchSelection() {
  document.querySelector('[data-citeciter-hmr-fixture]')?.remove()
  const flow = document.createElement('div')
  flow.dataset.citeciterHmrFixture = 'true'
  flow.dataset.chatFlowKind = 'assistant-step'
  flow.dataset.chatAnchorKey = '14:assistant-step1:1'
  flow.textContent = 'Riemann curvature tensor'
  document.body.appendChild(flow)
  const range = document.createRange()
  range.selectNodeContents(flow)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  flow.dispatchEvent(new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: 160,
    clientY: 100,
  }))
}

const result = {}
try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await page.waitForTimeout(2_000)
  await page.evaluate(dispatchSelection)
  await page.getByRole('menuitem', { name: menuLabel, exact: true }).waitFor({ timeout: 8_000 })
  result.before = menuLabel

  const marker = new TextEncoder().encode(`\n/* citeciter-hmr-smoke ${Date.now()} */\n`)
  const changedBundle = new Uint8Array(originalBundle.length + marker.length)
  changedBundle.set(originalBundle)
  changedBundle.set(marker, originalBundle.length)
  await replaceBundle(changedBundle)
  bundleChanged = true

  await page.waitForFunction(() => window.__citeciterHmrFrames.some((raw) => {
    try {
      const frame = JSON.parse(raw)
      return frame.type === 'rebuilt' && frame.id === '@kirkchinese/dsh-citeciter'
    } catch {
      return false
    }
  }), null, { timeout: 30_000 })
  await page.waitForFunction(() => document.querySelector('[data-citeciter-menu]') === null, null, { timeout: 8_000 })
  result.unmountedOldFiber = true

  await page.evaluate(dispatchSelection)
  await page.getByRole('menuitem', { name: menuLabel, exact: true }).waitFor({ timeout: 8_000 })
  result.after = menuLabel
  result.menuCount = await page.locator('[data-citeciter-menu]').count()
  result.frames = await page.evaluate(() => window.__citeciterHmrFrames
    .map((raw) => { try { return JSON.parse(raw) } catch { return null } })
    .filter((frame) => frame?.id === '@kirkchinese/dsh-citeciter'))
} catch (error) {
  result.failure = String(error)
}
result.errors = errors
const passed = result.failure === undefined
  && result.unmountedOldFiber === true
  && result.after === menuLabel
  && result.menuCount === 1
  && errors.length === 0
result.passed = passed
console.log(JSON.stringify(result, null, 2))
try {
  await browser.close()
} finally {
  if (bundleChanged) await replaceBundle(originalBundle)
  await rm(temporaryBundlePath, { force: true })
}
process.exitCode = passed ? 0 : 1
