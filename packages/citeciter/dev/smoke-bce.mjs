/** Keyless assembled-Web smoke for Phase B tool entries and Phase C Reader Topics. */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const fixtureMetadataPath = process.argv[3]
const screenshotPath = resolve(process.argv[4] ?? `/tmp/citeciter-bce-smoke-${process.pid}.png`)

if (!screenshotPath.startsWith('/tmp/')) {
  throw new Error('the smoke screenshot must stay under /tmp')
}
const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
if (metadata.kind !== 'citeciter-smoke-fixture-v2') throw new Error('the smoke requires a v2 source fixture')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

const out = { toolEntry: {}, reader: {}, errors }

async function dismissOptionalPrompts() {
  for (const name of ['稍后配置', '继续', 'Configure later', 'Continue']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  }
}

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await page.waitForTimeout(2_500)
  await dismissOptionalPrompts()
  const ungrouped = page.getByText(/^(未分组|Ungrouped)$/).first()
  if (await ungrouped.count() > 0) {
    await ungrouped.click({ force: true }).catch(() => {})
    await page.waitForTimeout(600)
  }
  const sourceRow = page.locator('[role="treeitem"]').filter({ hasText: /^CiteCiter/ }).last()
  await sourceRow.click({ force: true })
  await page.waitForTimeout(1_000)
  await dismissOptionalPrompts()

  // Phase B: claim the whole-card tool result from its call:<callId> row.
  const callId = '44444444-4444-4444-8444-444444444444'
  await page.waitForSelector(`[data-chat-call-id="${callId}"]`, { timeout: 10_000 })
  const toolDispatch = await page.evaluate((id) => {
    const row = document.querySelector(`[data-chat-call-id="${id}"]`)
    if (!(row instanceof HTMLElement)) throw new Error('tool row missing')
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 640, clientY: 300 })
    return { defaultPrevented: !row.dispatchEvent(event), callId: row.dataset.chatCallId }
  }, callId)
  out.toolEntry.dispatch = toolDispatch
  const toolPopover = page.getByRole('dialog', { name: '向 CiteCiter 提问' })
  await toolPopover.waitFor({ timeout: 8_000 })
  await toolPopover.getByLabel('CiteCiter 的第一个问题').fill('这个工具结果说明了什么？')
  await toolPopover.getByRole('button', { name: '开始提问', exact: true }).click()
  const panel = page.locator('[data-citeciter-panel]')
  await panel.waitFor({ timeout: 8_000 })
  await page.waitForFunction(() => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes('这个工具结果说明了什么？') === true
  ), null, { timeout: 20_000 })
  out.toolEntry.panelVisible = true

  // Phase C: import one Markdown document and create a Reading Topic from a selection.
  const readerTrigger = page.getByTitle('打开 CiteCiter 读书')
  await readerTrigger.click()
  const reader = page.locator('[data-citeciter-reader]')
  await reader.waitFor({ timeout: 8_000 })
  await reader.locator('input[type="file"]').setInputFiles({
    name: 'paper.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# 摘要\n\n曲率描述平行移动对路径的依赖。\n\n# 方法\n\n比较两条路径。'),
  })
  await page.getByRole('button', { name: /^paper\.md/ }).first().waitFor({ timeout: 10_000 })
  await page.getByRole('button', { name: /^paper\.md/ }).first().click()
  const content = reader.locator('textarea')
  await content.waitFor({ timeout: 8_000 })
  const selection = await content.evaluate((textarea) => {
    const value = textarea.value
    const start = value.indexOf('曲率描述')
    const end = start + '曲率描述平行移动对路径的依赖'.length
    textarea.focus()
    textarea.setSelectionRange(start, end)
    textarea.dispatchEvent(new Event('select', { bubbles: true }))
    textarea.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    return { start, end, quote: value.slice(start, end) }
  })
  out.reader.selection = selection
  await reader.getByLabel('读书面板的问题').fill('这一段在说什么？')
  await reader.getByRole('button', { name: 'Citer!', exact: true }).click()
  await page.waitForFunction(() => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes('这一段在说什么？') === true
  ), null, { timeout: 20_000 })
  out.reader.topicVisible = true
  await page.screenshot({ path: screenshotPath, fullPage: true })
} finally {
  await browser.close()
}

out.errors = errors
out.passed = out.toolEntry.dispatch?.defaultPrevented === true
  && out.toolEntry.panelVisible === true
  && out.reader.selection?.quote === '曲率描述平行移动对路径的依赖'
  && out.reader.topicVisible === true
  && errors.length === 0
console.log(JSON.stringify(out, null, 2))
process.exitCode = out.passed ? 0 : 1
