/**
 * Browser smoke for the built CiteCiter package.
 *
 * Prereq:
 *   1. pnpm --filter @deepseek-ai/dsh-citeciter build
 *   2. node dev/seed-smoke-session.mjs <temporary-dsh-home> <workspace>
 *   3. a temporary DSH Web instance whose profile resolves this package
 *      through dev/patch.yml.
 *
 * Usage:
 *   node dev/smoke.mjs <base-url> <session-title> [fixture-metadata]
 *   PLAYWRIGHT_PATH=/path/to/playwright/index.mjs node dev/smoke.mjs http://127.0.0.1:3907 'CiteCiter' /tmp/citeciter-dsh-home/citeciter-smoke.json
 */
import { readFile, stat } from 'node:fs/promises'

const playwrightModule = process.env.PLAYWRIGHT_PATH ?? 'playwright'
const { chromium: chromiumExport } = await import(playwrightModule)

const fixtureKind = 'citeciter-smoke-fixture-v1'
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const sessionTitle = process.argv[3] ?? 'CiteCiter'
const fixtureMetadataPath = process.argv[4]
let parentLogPath

async function readLogRevision(path) {
  const value = await stat(path, { bigint: true })
  return { size: value.size.toString(), mtimeNs: value.mtimeNs.toString() }
}

const browser = await chromiumExport.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const out = {}

async function dismissOptionalPrompts() {
  for (const name of ['稍后配置', '继续']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(600)
    }
  }
}

function selectSourceText({ clientX, clientY }) {
  const flow = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  if (flow === null) throw new Error('assistant-step fixture is not rendered')
  const needle = 'Riemann curvature tensor'
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
  let textNode = walker.nextNode()
  while (textNode !== null && !textNode.data.includes(needle)) textNode = walker.nextNode()
  if (textNode === null) throw new Error(`assistant fixture does not contain "${needle}"`)
  const start = textNode.data.indexOf(needle)
  const range = document.createRange()
  range.setStart(textNode, start)
  range.setEnd(textNode, start + needle.length)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY })
  return {
    defaultPrevented: !flow.dispatchEvent(event),
    selectedText: selection.toString(),
    anchorKey: flow.getAttribute('data-chat-anchor-key'),
  }
}

try {
  if (fixtureMetadataPath !== undefined) {
    const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
    if (metadata.kind !== fixtureKind || typeof metadata.logPath !== 'string') {
      throw new Error('fixture metadata is not a CiteCiter smoke fixture')
    }
    parentLogPath = metadata.logPath
    out.fixture = {
      anchorKey: metadata.anchorKey,
      anchorSeq: metadata.anchorSeq,
      sessionId: metadata.sessionId,
    }
  }
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(2500)
  await dismissOptionalPrompts()
  const ungrouped = page.getByText('未分组', { exact: true }).first()
  if (await ungrouped.count() > 0) {
    await ungrouped.click({ force: true }).catch(() => {})
    await page.waitForTimeout(800)
  }
  const expand = page.getByRole('button', { name: /展开其余/ }).first()
  if (await expand.count() > 0) {
    await expand.click({ force: true }).catch(() => {})
    await page.waitForTimeout(600)
  }
  const exactRows = page.locator('[role="treeitem"][aria-selected]').filter({
    has: page.getByText(sessionTitle, { exact: true }),
  })
  out.sessionRowCount = await exactRows.count()
  if (out.sessionRowCount !== 1) throw new Error(`expected one session row "${sessionTitle}", found ${out.sessionRowCount}`)
  await exactRows.click({ force: true })
  await page.waitForTimeout(600)
  await dismissOptionalPrompts()
  await page.waitForTimeout(900)
  const frame = page.locator('div[style*="grid-template-columns"]')
  out.frameBefore = await frame.evaluate((el) => el.style.gridTemplateColumns)

  await page.locator('[data-chat-flow-kind="assistant-step"]').last().waitFor({ timeout: 8000 })
  if (parentLogPath !== undefined) out.parentLogBefore = await readLogRevision(parentLogPath)
  out.dispatch = await page.evaluate(selectSourceText, { clientX: 220, clientY: 140 })

  await page.waitForFunction(() => document.querySelector('[data-citeciter-menu]') !== null, null, { timeout: 5000 })
  out.menuText = await page.locator('[data-citeciter-menu]').innerText()
  await page.getByRole('menuitem', { name: 'Citer!' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') !== null, null, { timeout: 8000 })
  await page.waitForFunction(() => document.querySelector('[data-citeciter-error]') !== null || document.querySelector('[data-citeciter-answer]') !== null, null, { timeout: 15000 })
  out.panelText = await page.locator('[data-citeciter-panel]').innerText()
  out.errorText = await page.locator('[data-citeciter-error]').count() > 0 ? await page.locator('[data-citeciter-error]').innerText() : null
  out.answerCount = await page.locator('[data-citeciter-answer]').count()
  out.frameOpen = await frame.evaluate((el) => el.style.gridTemplateColumns)
  out.menuAfterClick = await page.locator('[data-citeciter-menu]').count()

  await page.getByRole('button', { name: 'Close' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null, null, { timeout: 5000 })
  out.frameClosed = await frame.evaluate((el) => el.style.gridTemplateColumns)

  await page.evaluate(selectSourceText, { clientX: 260, clientY: 180 })
  await page.waitForFunction(() => document.querySelector('[data-citeciter-menu]') !== null, null, { timeout: 5000 })
  await page.getByRole('menuitem', { name: 'Citer!' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') !== null, null, { timeout: 8000 })
  out.reopenPanelCount = await page.locator('[data-citeciter-panel]').count()
  out.frameReopen = await frame.evaluate((el) => el.style.gridTemplateColumns)
  if (parentLogPath !== undefined) out.parentLogAfter = await readLogRevision(parentLogPath)
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 600)
  out.menuAtFailure = await page.locator('[data-citeciter-menu]').count()
  out.panelAtFailure = await page.locator('[data-citeciter-panel]').count()
  const frame = page.locator('div[style*="grid-template-columns"]')
  out.frameAtFailure = await frame.evaluate((el) => el.style.gridTemplateColumns)
}
out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && out.dispatch?.defaultPrevented === true
  && out.dispatch?.anchorKey === '14:assistant-step1:1'
  && out.dispatch?.selectedText === 'Riemann curvature tensor'
  && out.menuText?.includes('Citer!') === true
  && typeof out.panelText === 'string'
  && (out.errorText !== null || out.answerCount > 0)
  && out.menuAfterClick === 0
  && out.frameOpen !== out.frameBefore
  && out.frameClosed === out.frameBefore
  && out.reopenPanelCount === 1
  && out.frameReopen === out.frameOpen
  && (parentLogPath === undefined || (
    out.parentLogAfter?.size === out.parentLogBefore?.size
    && out.parentLogAfter?.mtimeNs === out.parentLogBefore?.mtimeNs
  ))
  && out.errors.length === 0
console.log(JSON.stringify(out, null, 2))
await browser.close()
process.exitCode = out.passed ? 0 : 1
