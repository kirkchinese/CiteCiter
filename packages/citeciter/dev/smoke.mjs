/** Keyless assembled-Web smoke for the CiteCiter Observer Topic flow. */
import { readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const sessionTitle = process.argv[3] ?? 'CiteCiter'
const fixtureMetadataPath = process.argv[4]
const screenshotPath = resolve(process.argv[5] ?? `/tmp/citeciter-v03-smoke-${process.pid}.png`)
const firstQuestion = '为什么平行移动能检测曲率？'
const followUpQuestion = '第二轮追问：这和 holonomy 有什么关系？'
const secondQuestion = '路径依赖为什么能代表几何弯曲？'
const firstAnswer = '首轮回答：平行移动比较同一向量沿不同路径返回后的差异；这个差异由曲率刻画。'
const followUpAnswer = '第二轮回答：曲率可以看成无穷小闭合回路的 holonomy；回路越小，偏差的一阶面积项越直接反映曲率。'
const generatedTitle = '曲率与平行移动'
const renamedTitle = '曲率学习 Topic'

if (fixtureMetadataPath === undefined) {
  throw new Error('usage: node dev/smoke.mjs <url> <session-title> <fixture-metadata.json> [screenshot-under-/tmp]')
}
if (!screenshotPath.startsWith('/tmp/')) {
  throw new Error('the smoke screenshot must stay under /tmp')
}

async function revision(path) {
  const value = await stat(path, { bigint: true })
  return { size: String(value.size), mtimeNs: String(value.mtimeNs) }
}

async function dismissOptionalPrompts(page) {
  for (const name of ['稍后配置', '继续', 'Configure later', 'Continue']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  }
}

function selectSourceText(needle) {
  const flow = [...document.querySelectorAll('[data-chat-flow-kind="assistant-step"]')]
    .find((candidate) => candidate.textContent?.includes(needle))
  if (!(flow instanceof HTMLElement)) throw new Error(`assistant fixture does not contain "${needle}"`)
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node !== null && !node.data.includes(needle)) node = walker.nextNode()
  if (node === null) throw new Error(`assistant fixture does not contain "${needle}" in one text node`)
  const start = node.data.indexOf(needle)
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, start + needle.length)
  const selected = window.getSelection()
  selected.removeAllRanges()
  selected.addRange(range)
  const box = range.getBoundingClientRect()
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: Math.max(24, Math.min(box.left, window.innerWidth - 420)),
    clientY: Math.max(24, Math.min(box.bottom, window.innerHeight - 280)),
  })
  return {
    defaultPrevented: !flow.dispatchEvent(event),
    selectedText: selected.toString(),
    anchorKey: flow.dataset.chatAnchorKey,
  }
}

async function askFromSelection(page, needle, question) {
  const dispatch = await page.evaluate(selectSourceText, needle)
  const popover = page.getByRole('dialog', { name: '向 CiteCiter 提问' })
  await popover.waitFor({ timeout: 8_000 })
  const mode = await popover.locator('select').inputValue()
  await popover.getByLabel('CiteCiter 的第一个问题').fill(question)
  await popover.getByRole('button', { name: 'Citer!', exact: true }).click()
  return { dispatch, mode }
}

async function waitForPanelText(page, text, timeout = 20_000) {
  await page.waitForFunction((expected) => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected) === true
  ), text, { timeout })
}

const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
if (metadata.kind !== 'citeciter-smoke-fixture-v2' || metadata.openTurn !== true) {
  throw new Error('the smoke requires an open-turn v2 source fixture')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const out = {
  fixture: {
    sessionId: metadata.sessionId,
    anchorKey: metadata.anchorKey,
    anchorSeq: metadata.anchorSeq,
    openTurn: metadata.openTurn,
  },
  screenshotPath,
}

try {
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

  const escapedTitle = sessionTitle.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  const sourceRow = page.getByRole('treeitem', { name: new RegExp(`^${escapedTitle}\\s+`) })
  out.sourceRows = await sourceRow.count()
  if (out.sourceRows !== 1) throw new Error(`expected one source row, found ${out.sourceRows}`)
  const assistantFlow = page.locator('[data-chat-flow-kind="assistant-step"]').last()
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    out.sourceOpenAttempts = attempt
    await sourceRow.click({ force: true })
    await page.waitForTimeout(700)
    await dismissOptionalPrompts(page)
    const opened = await assistantFlow.waitFor({ timeout: 6_000 }).then(() => true, () => false)
    if (opened) break
    if (attempt === 3) throw new Error('source session did not render after three attempts')
  }

  out.parentBefore = await revision(metadata.logPath)
  const first = await askFromSelection(page, 'Riemann curvature tensor', firstQuestion)
  out.firstDispatch = first.dispatch
  out.defaultMode = first.mode

  const panel = page.locator('[data-citeciter-panel]')
  await panel.waitFor({ timeout: 8_000 })
  await waitForPanelText(page, firstQuestion)
  await waitForPanelText(page, firstAnswer)
  await page.waitForFunction(() => /已读至 seq \d+/u.test(
    document.querySelector('[data-citeciter-panel]')?.textContent ?? '',
  ), null, { timeout: 20_000 })
  await waitForPanelText(page, generatedTitle)
  await page.waitForFunction((expected) => (
    document.querySelector('[data-citeciter-panel] input[aria-label="Topic 标题"]')?.value === expected
  ), generatedTitle, { timeout: 8_000 })
  out.panelWidth = await panel.evaluate((element) => element.getBoundingClientRect().width)
  out.docked = await page.locator('[data-citeciter-docked="true"]').count()
  out.sourceVisibleBesidePanel = await assistantFlow.isVisible()
  out.firstQuestionVisible = (await panel.innerText()).includes(firstQuestion)
  out.firstAnswerVisible = (await panel.innerText()).includes(firstAnswer)
  const sourceRead = (await panel.innerText()).match(/已读至 seq (\d+)/u)
  out.observedThroughSeq = sourceRead === null ? null : Number(sourceRead[1])
  out.generatedTitle = await panel.getByLabel('Topic 标题').inputValue()
  out.topicCountAfterFirst = await panel.locator('[data-citeciter-topic]').count()
  const shellFrame = page.locator('[data-citeciter-docked="true"]')
  await page.getByRole('button', { name: /^(收起侧边栏|Collapse sidebar)$/u }).click()
  await page.waitForTimeout(300)
  out.collapsedSidebarWidth = await shellFrame.evaluate((element) => (
    element.firstElementChild?.getBoundingClientRect().width ?? 0
  ))
  await page.getByRole('button', { name: /^(打开侧边栏|Open sidebar)$/u }).click()
  await page.waitForTimeout(300)
  out.expandedSidebarWidth = await shellFrame.evaluate((element) => (
    element.firstElementChild?.getBoundingClientRect().width ?? 0
  ))

  await panel.getByLabel('Topic 标题').fill(renamedTitle)
  await panel.getByRole('button', { name: '保存标题', exact: true }).click()
  await page.waitForFunction((expected) => (
    [...document.querySelectorAll('[data-citeciter-topic] strong')].some((node) => node.textContent === expected)
  ), renamedTitle, { timeout: 8_000 })
  await panel.getByRole('button', { name: '关闭 CiteCiter' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null)
  out.launcherAfterFirst = await page.getByRole('button', { name: /打开 CiteCiter，共 1 个讨论/ }).count()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2_500)
  await dismissOptionalPrompts(page)
  const recoveredLauncher = page.getByRole('button', { name: /打开 CiteCiter/ })
  await recoveredLauncher.waitFor({ timeout: 8_000 })
  await recoveredLauncher.click()
  await panel.waitFor({ timeout: 5_000 })
  const recoveredTitle = panel.getByLabel('Topic 标题')
  await recoveredTitle.waitFor({ timeout: 8_000 })
  await page.waitForFunction((expected) => (
    document.querySelector('[data-citeciter-panel] input[aria-label="Topic 标题"]')?.value === expected
  ), renamedTitle, { timeout: 8_000 })
  await waitForPanelText(page, firstQuestion)
  out.recoveredTitle = await recoveredTitle.inputValue()
  out.recoveredQuestion = (await panel.innerText()).includes(firstQuestion)
  out.recoveredTopics = await panel.locator('[data-citeciter-topic]').count()

  await panel.locator('textarea').fill(followUpQuestion)
  await panel.getByRole('button', { name: '发送', exact: true }).click()
  await waitForPanelText(page, followUpQuestion)
  await waitForPanelText(page, followUpAnswer)
  out.followUpQuestionVisible = (await panel.innerText()).includes(followUpQuestion)
  out.followUpAnswerVisible = (await panel.innerText()).includes(followUpAnswer)

  await panel.getByRole('button', { name: '关闭 CiteCiter' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null)
  const second = await askFromSelection(page, 'parallel transport', secondQuestion)
  out.secondDispatch = second.dispatch
  out.secondMode = second.mode
  await panel.waitFor({ timeout: 8_000 })
  await waitForPanelText(page, secondQuestion)
  await waitForPanelText(page, firstAnswer)
  await page.waitForFunction(() => document.querySelectorAll('[data-citeciter-topic]').length === 2, null, { timeout: 10_000 })
  out.secondQuestionVisible = (await panel.innerText()).includes(secondQuestion)
  out.topicCountAfterSecond = await panel.locator('[data-citeciter-topic]').count()
  out.activeSecondTopic = await panel.locator('[data-citeciter-topic][data-active="true"]').count()

  await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll('[data-citeciter-topic]').length === 1, null, { timeout: 8_000 })
  out.topicCountAfterArchive = await panel.locator('[data-citeciter-topic]').count()
  await panel.getByRole('button', { name: '查看归档', exact: true }).click()
  await panel.getByRole('button', { name: '恢复当前 Topic', exact: true }).waitFor({ timeout: 8_000 })
  out.archiveViewCount = await panel.locator('[data-citeciter-topic]').count()
  out.archivedTopicCanRestore = await panel.getByRole('button', { name: '恢复当前 Topic', exact: true }).count()
  out.privateRowsInMainList = await page.locator('[role="treeitem"]').evaluateAll((rows, titles) => (
    rows.filter((row) => titles.some((title) => row.textContent?.includes(title))).length
  ), [generatedTitle, renamedTitle])
  out.sourceRowsAfter = await sourceRow.count()

  await page.screenshot({ path: screenshotPath, fullPage: true })
  await panel.getByRole('button', { name: '关闭 CiteCiter' }).click()
  await page.waitForFunction(() => document.querySelector('[data-citeciter-panel]') === null)
  out.launcherAfterArchive = await page.getByRole('button', { name: /打开 CiteCiter，共 1 个讨论/ }).count()
  out.parentAfter = await revision(metadata.logPath)
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 1_600)
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
}

out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && out.fixture.openTurn === true
  && out.firstDispatch?.defaultPrevented === true
  && out.firstDispatch?.selectedText === 'Riemann curvature tensor'
  && out.firstDispatch?.anchorKey === metadata.anchorKey
  && out.defaultMode === 'observer'
  && out.panelWidth >= 360
  && out.docked === 1
  && out.sourceVisibleBesidePanel === true
  && out.firstQuestionVisible === true
  && out.firstAnswerVisible === true
  && out.observedThroughSeq >= metadata.anchorSeq
  && out.generatedTitle === generatedTitle
  && out.topicCountAfterFirst === 1
  && out.collapsedSidebarWidth <= 64
  && out.expandedSidebarWidth >= 200
  && out.launcherAfterFirst === 1
  && out.recoveredTitle === renamedTitle
  && out.recoveredQuestion === true
  && out.recoveredTopics === 1
  && out.followUpQuestionVisible === true
  && out.followUpAnswerVisible === true
  && out.secondDispatch?.defaultPrevented === true
  && out.secondDispatch?.selectedText === 'parallel transport'
  && out.secondDispatch?.anchorKey === metadata.anchorKey
  && out.secondMode === 'observer'
  && out.secondQuestionVisible === true
  && out.topicCountAfterSecond === 2
  && out.activeSecondTopic === 1
  && out.topicCountAfterArchive === 1
  && out.archiveViewCount === 1
  && out.archivedTopicCanRestore === 1
  && out.privateRowsInMainList === 0
  && out.sourceRowsAfter === 1
  && out.launcherAfterArchive === 1
  && JSON.stringify(out.parentBefore) === JSON.stringify(out.parentAfter)
  && out.errors.length === 0

console.log(JSON.stringify(out, null, 2))
await browser.close()
process.exitCode = out.passed ? 0 : 1
