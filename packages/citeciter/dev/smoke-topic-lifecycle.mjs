/** Keyless assembled-Web smoke for free Topics and permanent deletion. */
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const fixtureMetadataPath = process.argv[3]
const screenshotPath = resolve(process.argv[4] ?? `/tmp/citeciter-topic-lifecycle-${process.pid}.png`)

if (fixtureMetadataPath === undefined) {
  throw new Error('usage: node dev/smoke-topic-lifecycle.mjs <url> <fixture-metadata.json> [screenshot-under-/tmp]')
}
if (!screenshotPath.startsWith('/tmp/')) throw new Error('the smoke screenshot must stay under /tmp')
const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
if (metadata.kind !== 'citeciter-smoke-fixture-v2') throw new Error('the smoke requires a v2 source fixture')
const dshHome = dirname(resolve(fixtureMetadataPath))
const privateRoot = resolve(dshHome, 'citeciter')

async function revision(path) {
  const value = await stat(path, { bigint: true })
  return { size: String(value.size), mtimeNs: String(value.mtimeNs) }
}

async function privatePathsContaining(needle) {
  try {
    return (await readdir(privateRoot, { recursive: true })).filter((path) => path.includes(needle))
  } catch (error) {
    if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return []
    throw error
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const out = { screenshotPath, errors }

async function dismissOptionalPrompts() {
  for (const name of ['稍后配置', '继续', 'Configure later', 'Continue']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) {
      await button.first().click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  }
}

async function createFreeTopic(panel, scenario, question) {
  const opener = panel.locator('button:visible').filter({ hasText: /^\+ 新 Topic$/u }).first()
  await opener.click()
  const modal = page.getByRole('dialog', { name: '新建自由 Topic' })
  await modal.waitFor({ timeout: 5_000 })
  if (out.newTopicDialogFits === undefined) {
    out.newTopicDialogFits = await modal.evaluate((element) => {
      const form = element.querySelector('[class*="newTopicForm"]')
      return element.scrollWidth <= element.clientWidth
        && form instanceof HTMLElement && form.scrollWidth <= form.clientWidth
    })
    out.backgroundInert = await modal.evaluate(() => {
      const root = document.getElementById('root')
      return root?.hasAttribute('inert') === true && root.getAttribute('aria-hidden') === 'true'
    })
  }
  await modal.getByRole('button', {
    name: scenario === 'present' ? /^讲解 配合小黑板逐步说明$/u : /^问答 围绕问题直接分析$/u,
  }).click()
  await modal.getByLabel('自由 Topic 的首个问题').fill(question)
  const submit = modal.getByRole('button', { name: scenario === 'present' ? '开始讲解' : '开始问答', exact: true })
  if (out.modalFocusWraps === undefined) {
    await submit.focus()
    await page.keyboard.press('Tab')
    out.modalFocusWraps = await modal.getByRole('button', { name: '关闭', exact: true })
      .evaluate((element) => document.activeElement === element)
  }
  await submit.click()
  await modal.waitFor({ state: 'hidden', timeout: 20_000 })
  if (out.modalFocusReturns === undefined) {
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === '+ 新 Topic')
    out.modalFocusReturns = await opener.evaluate((element) => document.activeElement === element)
  }
  await page.waitForFunction((expected) => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes(expected) === true
  ), question, { timeout: 20_000 })
  await page.waitForFunction(() => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes('首轮回答：') === true
  ), null, { timeout: 30_000 })
  await page.waitForFunction(() => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes('可以继续追问') === true
  ), null, { timeout: 20_000 })
  return panel.locator('[data-citeciter-topic][data-active]').getAttribute('data-citeciter-topic')
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
  out.sourceBefore = await revision(metadata.logPath)

  const panel = page.locator('[data-citeciter-panel]')
  if (!await panel.isVisible()) {
    await page.getByRole('button', { name: /打开 CiteCiter/ }).click()
  }
  await panel.waitFor({ timeout: 8_000 })

  out.qaSessionId = await createFreeTopic(panel, 'qa', '自由问答：曲率和路径依赖是什么关系？')
  out.qaHasNoCitation = (await panel.innerText()).includes('无引用 · 自由讨论')
  out.qaArtifactsBefore = await privatePathsContaining(out.qaSessionId ?? '')

  out.presenterSessionId = await createFreeTopic(panel, 'present', '自由讲解：请在黑板上说明曲率')
  out.presenterHasNoCitation = (await panel.innerText()).includes('无引用 · 自由讨论')
  out.presenterArtifactsBefore = await privatePathsContaining(out.presenterSessionId ?? '')
  if (out.presenterSessionId === null) throw new Error('free Presenter Topic did not expose a Session id')

  await panel.getByRole('button', { name: '永久删除', exact: true }).click()
  const deleteModal = page.getByRole('dialog', { name: '永久删除 Topic' })
  await deleteModal.waitFor({ timeout: 5_000 })
  out.deleteDialogFits = await deleteModal.evaluate((element) => {
    const form = element.querySelector('[class*="deleteForm"]')
    return element.scrollWidth <= element.clientWidth
      && form instanceof HTMLElement && form.scrollWidth <= form.clientWidth
  })
  await deleteModal.getByLabel('输入 Topic Session ID 以确认永久删除').fill(out.presenterSessionId)
  const confirmDelete = deleteModal.getByRole('button', { name: '永久删除', exact: true })
  await confirmDelete.focus()
  await page.keyboard.press('Tab')
  out.deleteFocusWraps = await deleteModal.getByRole('button', { name: '关闭', exact: true })
    .evaluate((element) => document.activeElement === element)
  await confirmDelete.click()
  await page.waitForFunction((sessionId) => (
    document.querySelector(`[data-citeciter-topic="${CSS.escape(sessionId)}"]`) === null
  ), out.presenterSessionId, { timeout: 12_000 })
  out.deleteNotice = await panel.getByRole('status').filter({ hasText: /Topic 已/ }).innerText()
  out.presenterArtifactsAfter = await privatePathsContaining(out.presenterSessionId)
  out.qaArtifactsAfter = await privatePathsContaining(out.qaSessionId ?? '')
  out.qaTopicRetained = await panel.locator(`[data-citeciter-topic="${out.qaSessionId}"]`).count()
  out.sourceRowsAfter = await sourceRow.count()
  out.sourceAfter = await revision(metadata.logPath)
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-citeciter-panel]')
    return panel?.contains(document.activeElement) === true
  })
  out.deleteFocusReturnsInsidePanel = await panel.evaluate((element) => element.contains(document.activeElement))
  await page.screenshot({ path: screenshotPath, fullPage: true })
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 1_800)
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && typeof out.qaSessionId === 'string'
  && typeof out.presenterSessionId === 'string'
  && out.qaSessionId !== out.presenterSessionId
  && out.qaHasNoCitation === true
  && out.presenterHasNoCitation === true
  && out.newTopicDialogFits === true
  && out.deleteDialogFits === true
  && out.backgroundInert === true
  && out.modalFocusWraps === true
  && out.deleteFocusWraps === true
  && out.modalFocusReturns === true
  && out.deleteFocusReturnsInsidePanel === true
  && out.qaArtifactsBefore.length > 0
  && out.presenterArtifactsBefore.length > 0
  && out.presenterArtifactsAfter.length === 0
  && out.qaArtifactsAfter.length > 0
  && out.qaTopicRetained === 1
  && /^Topic 已(?:永久)?删除/u.test(out.deleteNotice ?? '')
  && out.sourceRowsAfter === 1
  && JSON.stringify(out.sourceBefore) === JSON.stringify(out.sourceAfter)
  && out.errors.length === 0
console.log(JSON.stringify(out, null, 2))
process.exitCode = out.passed ? 0 : 1
