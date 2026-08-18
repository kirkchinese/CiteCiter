/** End-to-end browser smoke for the durable CiteCiter v0.2 Thread flow. */
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const sessionTitle = process.argv[3] ?? 'CiteCiter'
const fixtureMetadataPath = process.argv[4]
const question = '为什么平行移动能检测曲率？'
let parentLogPath

async function revision(path) {
  const value = await stat(path, { bigint: true })
  return { size: String(value.size), mtimeNs: String(value.mtimeNs) }
}

async function dismissOptionalPrompts(page) {
  for (const name of ['稍后配置', '继续']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  }
}

function selectSourceText(needle = 'Riemann curvature tensor') {
  const flow = document.querySelector('[data-chat-flow-kind="assistant-step"]')
  if (flow === null) throw new Error('assistant-step fixture is not rendered')
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node !== null && !node.data.includes(needle)) node = walker.nextNode()
  if (node === null) throw new Error(`assistant fixture does not contain "${needle}"`)
  const start = node.data.indexOf(needle)
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, start + needle.length)
  const selected = window.getSelection()
  selected.removeAllRanges()
  selected.addRange(range)
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: 260,
    clientY: 160,
  })
  return {
    defaultPrevented: !flow.dispatchEvent(event),
    selectedText: selected.toString(),
    anchorKey: flow.getAttribute('data-chat-anchor-key'),
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const out = {}

try {
  if (fixtureMetadataPath !== undefined) {
    const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
    if (metadata.kind !== 'citeciter-smoke-fixture-v1') throw new Error('invalid smoke fixture metadata')
    parentLogPath = metadata.logPath
    out.fixture = {
      sessionId: metadata.sessionId,
      anchorKey: metadata.anchorKey,
      anchorSeq: metadata.anchorSeq,
    }
  }

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  await page.waitForTimeout(2_500)
  await dismissOptionalPrompts(page)
  const ungrouped = page.getByText('未分组', { exact: true }).first()
  if (await ungrouped.count() > 0) {
    await ungrouped.click({ force: true }).catch(() => {})
    await page.waitForTimeout(600)
  }
  const expand = page.getByRole('button', { name: /展开其余/ }).first()
  if (await expand.count() > 0) {
    await expand.click({ force: true }).catch(() => {})
    await page.waitForTimeout(500)
  }

  const sourceRow = page.locator('[role="treeitem"][aria-selected]').filter({
    has: page.getByText(sessionTitle, { exact: true }),
  })
  out.sourceRows = await sourceRow.count()
  if (out.sourceRows !== 1) throw new Error(`expected one source row, found ${out.sourceRows}`)
  const assistantFlow = page.locator('[data-chat-flow-kind="assistant-step"]').last()
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    out.sourceOpenAttempts = attempt
    await sourceRow.click({ force: true })
    await page.waitForTimeout(700)
    await dismissOptionalPrompts(page)
    await page.waitForTimeout(800)
    const opened = await assistantFlow.waitFor({ timeout: 6_000 }).then(() => true, () => false)
    if (opened) break
    if (attempt === 3) throw new Error('source session did not render after three attempts')
  }

  if (parentLogPath !== undefined) out.parentBefore = await revision(parentLogPath)
  out.dispatch = await page.evaluate(selectSourceText)
  await page.getByRole('menuitem', { name: 'Citer!', exact: true }).click()
  const panel = page.locator('[data-citeciter-panel]')
  await panel.waitFor({ timeout: 8_000 })
  await page.waitForTimeout(400)
  out.initialPanelWidth = await panel.evaluate((element) => element.getBoundingClientRect().width)
  out.initialPlaceholder = await panel.locator('textarea').getAttribute('placeholder')
  out.initialQuickQuestions = await panel.locator('button').filter({ hasText: /解释|例子|为什么/ }).count()

  await panel.locator('textarea').fill(question)
  await panel.getByRole('button', { name: '发送', exact: true }).click()
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-citeciter-panel]')
    return root?.querySelector('input[aria-label="Thread 名称"]') !== null
      && root?.querySelector('select') !== null
  }, null, { timeout: 15_000 })
  await page.waitForFunction((expected) => document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected), question, {
    timeout: 15_000,
  })

  out.questionVisible = (await panel.innerText()).includes(question)
  out.errorText = await panel.locator('[data-citeciter-error]').count() > 0
    ? await panel.locator('[data-citeciter-error]').innerText()
    : null
  out.historyPicker = await panel.getByText('历史 Threads', { exact: true }).count()
  out.launcher = await page.getByRole('button', { name: /打开 1 个 Citation Threads/ }).count()

  await panel.getByLabel('Thread 名称').fill('曲率学习 Thread')
  await panel.getByRole('button', { name: '保存', exact: true }).click()
  await page.waitForTimeout(500)
  out.renamed = (await panel.getByLabel('Thread 名称').inputValue()) === '曲率学习 Thread'

  await panel.getByRole('button', { name: '关闭 CiteCiter' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null)
  await page.getByRole('button', { name: /打开 1 个 Citation Threads/ }).click()
  await panel.waitFor({ timeout: 5_000 })
  out.reopened = await panel.count()

  // A full page reload must rediscover the durable projection and launcher.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2_500)
  await dismissOptionalPrompts(page)
  const recoveredLauncher = page.getByRole('button', { name: /打开 1 个 Citation Threads/ })
  await recoveredLauncher.waitFor({ timeout: 8_000 })
  out.recoveredLauncher = await recoveredLauncher.count()
  await recoveredLauncher.click()
  await panel.waitFor({ timeout: 5_000 })
  const picker = panel.locator('select')
  await picker.selectOption({ index: 1 })
  await page.waitForFunction((expected) => document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected), question, {
    timeout: 8_000,
  })
  out.recoveredQuestion = (await panel.innerText()).includes(question)
  out.recoveredTitle = await panel.getByLabel('Thread 名称').inputValue()
  await page.waitForTimeout(500)
  out.recoveredPanelWidth = await panel.evaluate((element) => element.getBoundingClientRect().width)

  // Reapplying read-only on a genuine follow-up is idempotent: DSH may log only
  // command/run + command/done, so the already-effective child state must pass.
  const followUpQuestion = '第二轮追问：这个曲率结论还能怎样理解？'
  await panel.locator('textarea').fill(followUpQuestion)
  await panel.getByRole('button', { name: '发送', exact: true }).click()
  await page.waitForFunction((expected) => document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected), followUpQuestion, {
    timeout: 15_000,
  })
  out.followUpVisible = (await panel.innerText()).includes(followUpQuestion)
  out.followUpErrorText = await panel.locator('[data-citeciter-error]').count() > 0
    ? await panel.locator('[data-citeciter-error]').innerText()
    : null

  // A second range in the same answer must become a distinct Thread. Switch
  // back to the first one, then archive only the second through the supported
  // workspace API; the source session remains selected throughout.
  await panel.getByRole('button', { name: '关闭 CiteCiter' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null)
  out.secondDispatch = await page.evaluate(selectSourceText, 'parallel transport')
  await page.getByRole('menuitem', { name: 'Citer!', exact: true }).click()
  await panel.waitFor({ timeout: 5_000 })
  const secondQuestion = '这和 holonomy 有什么关系？'
  await panel.locator('textarea').fill(secondQuestion)
  await panel.getByRole('button', { name: '发送', exact: true }).click()
  await page.waitForFunction((expected) => {
    const root = document.querySelector('[data-citeciter-panel]')
    return root?.querySelectorAll('select option').length === 3 && root.textContent?.includes(expected)
  }, secondQuestion, { timeout: 15_000 })
  out.distinctThreadOptions = await panel.locator('select option').count()
  out.secondQuestionVisible = (await panel.innerText()).includes(secondQuestion)
  out.twoThreadLauncher = await page.getByRole('button', { name: /打开 2 个 Citation Threads/ }).count()
  const secondThreadId = await picker.inputValue()

  await picker.selectOption({ label: '曲率学习 Thread' })
  await page.waitForFunction((expected) => document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected), question, {
    timeout: 8_000,
  })
  out.switchedToFirst = (await panel.innerText()).includes(question)
  await picker.selectOption(secondThreadId)
  await page.waitForFunction((expected) => document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected), secondQuestion, {
    timeout: 8_000,
  })
  out.switchedBackToSecond = (await panel.innerText()).includes(secondQuestion)
  await panel.getByRole('button', { name: '归档', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel] select')?.querySelectorAll('option').length === 2, null, {
    timeout: 8_000,
  })
  out.optionsAfterArchive = await picker.locator('option').count()
  out.launcherAfterArchive = await page.getByRole('button', { name: /打开 1 个 Citation Threads/ }).count()

  if (parentLogPath !== undefined) out.parentAfter = await revision(parentLogPath)
  await page.screenshot({
    path: fileURLToPath(new URL('../../../artifacts/citeciter-v02-smoke.png', import.meta.url)),
    fullPage: true,
  })
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 1_200)
}

out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && out.dispatch?.defaultPrevented === true
  && out.dispatch?.selectedText === 'Riemann curvature tensor'
  && out.dispatch?.anchorKey === '14:assistant-step1:1'
  && out.initialPanelWidth >= 320
  && out.initialPlaceholder === '你想从哪一点开始？'
  && out.initialQuickQuestions >= 3
  && out.questionVisible === true
  && out.historyPicker === 1
  && out.launcher === 1
  && out.renamed === true
  && out.reopened === 1
  && out.recoveredLauncher === 1
  && out.recoveredQuestion === true
  && out.recoveredTitle === '曲率学习 Thread'
  && out.recoveredPanelWidth >= 320
  && out.followUpVisible === true
  && !/(prepareThread|read-only switch failed|without applying read-only)/iu.test(out.followUpErrorText ?? '')
  && out.secondDispatch?.defaultPrevented === true
  && out.secondDispatch?.selectedText === 'parallel transport'
  && out.distinctThreadOptions === 3
  && out.secondQuestionVisible === true
  && out.twoThreadLauncher === 1
  && out.switchedToFirst === true
  && out.switchedBackToSecond === true
  && out.optionsAfterArchive === 2
  && out.launcherAfterArchive === 1
  && !/(unknown|prepareThread|without inject|read-only switch failed)/iu.test(out.errorText ?? '')
  && (parentLogPath === undefined || JSON.stringify(out.parentBefore) === JSON.stringify(out.parentAfter))
  && out.errors.length === 0

console.log(JSON.stringify(out, null, 2))
await browser.close()
process.exitCode = out.passed ? 0 : 1
