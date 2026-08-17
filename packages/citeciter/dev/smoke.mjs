/**
 * Browser smoke for the built CiteCiter package (milestone 0).
 *
 * Prereq:
 *   1. pnpm --filter @deepseek-ai/dsh-citeciter build
 *   2. a temp DSH web instance whose profile resolves
 *      @deepseek-ai/dsh-citeciter (see dev/patch.yml) and whose page has at
 *      least one non-blank session.
 *
 * Usage:
 *   node dev/smoke.mjs <base-url> <session-title-substring>
 *   PLAYWRIGHT_PATH=/path/to/playwright/index.mjs node dev/smoke.mjs http://127.0.0.1:3907 'make me non blank'
 */
const playwrightPath = process.env.PLAYWRIGHT_PATH ?? 'playwright'
const { chromium: chromiumExport } = await import(playwrightPath)

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const sessionSubstring = process.argv[3] ?? 'make me non blank'

const browser = await chromiumExport.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('ERR_')) errors.push(message.text())
})
const out = {}
try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(2500)
  for (const name of ['稍后配置', '继续']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(600)
    }
  }
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
  const row = page.getByText(sessionSubstring, { exact: false }).last()
  out.sessionRowCount = await row.count()
  if (await row.count() > 0) {
    await row.click({ force: true }).catch(() => {})
    await page.waitForTimeout(1500)
  }
  const frame = page.locator('div.pI_x6G_frame')
  out.frameBefore = await frame.evaluate((el) => el.style.gridTemplateColumns)

  out.dispatch = await page.evaluate(() => {
    const flow = document.createElement('div')
    flow.setAttribute('data-chat-flow-kind', 'assistant-step')
    flow.setAttribute('data-chat-anchor-key', '42:assistant-step7')
    flow.innerHTML = '<div>Here is a term: Riemann curvature tensor, which is dense.</div>'
    document.body.appendChild(flow)
    const textNode = flow.querySelector('div').firstChild
    const range = document.createRange()
    range.setStart(textNode, 17)
    range.setEnd(textNode, 41)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 220, clientY: 140 })
    return { defaultPrevented: !flow.dispatchEvent(event), selectedText: selection.toString() }
  })

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

  await page.evaluate(() => {
    const flow = document.querySelector('[data-chat-flow-kind="assistant-step"]')
    const textNode = flow.querySelector('div').firstChild
    const range = document.createRange()
    range.setStart(textNode, 17)
    range.setEnd(textNode, 41)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 260, clientY: 180 })
    flow.dispatchEvent(event)
  })
  await page.waitForFunction(() => document.querySelector('[data-citeciter-menu]') !== null, null, { timeout: 5000 })
  await page.getByRole('menuitem', { name: 'Citer!' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') !== null, null, { timeout: 8000 })
  out.reopenPanelCount = await page.locator('[data-citeciter-panel]').count()
  out.frameReopen = await frame.evaluate((el) => el.style.gridTemplateColumns)
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 600)
  out.menuAtFailure = await page.locator('[data-citeciter-menu]').count()
  out.panelAtFailure = await page.locator('[data-citeciter-panel]').count()
  const frame = page.locator('div.pI_x6G_frame')
  out.frameAtFailure = await frame.evaluate((el) => el.style.gridTemplateColumns)
}
out.errors = errors.slice(0, 10)
console.log(JSON.stringify(out, null, 2))
await browser.close()
