/** Keyless assembled-Web smoke for the protocol-v4 Presenter workspace. */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const fixtureMetadataPath = process.argv[3]
const screenshotPath = resolve(process.argv[4] ?? `/tmp/citeciter-board-smoke-${process.pid}.png`)
const narrowScreenshotPath = screenshotPath.replace(/(\.[^.]+)?$/u, '-narrow$1')

if (fixtureMetadataPath === undefined) {
  throw new Error('usage: node dev/smoke-board.mjs <url> <fixture-metadata.json> [screenshot-under-/tmp]')
}
if (!screenshotPath.startsWith('/tmp/') || !narrowScreenshotPath.startsWith('/tmp/')) {
  throw new Error('smoke screenshots must stay under /tmp')
}
const metadata = JSON.parse(await readFile(fixtureMetadataPath, 'utf8'))
if (metadata.kind !== 'citeciter-smoke-fixture-v2') throw new Error('the smoke requires a v2 source fixture')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
const remoteBoardRequests = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('request', (request) => {
  if (request.url().startsWith('https://remote.invalid/')) remoteBoardRequests.push(request.url())
})
const out = { screenshotPath, narrowScreenshotPath, errors }

async function dismissOptionalPrompts() {
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
  return { defaultPrevented: !flow.dispatchEvent(event), selectedText: selected.toString() }
}

async function openSource() {
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
}

try {
  await openSource()
  const needle = 'Riemann curvature tensor measures how parallel transport'
  await page.waitForFunction((text) => (
    [...document.querySelectorAll('[data-chat-flow-kind="assistant-step"]')]
      .some((node) => node.textContent?.includes(text))
  ), needle, { timeout: 10_000 })
  out.dispatch = await page.evaluate(selectSourceText, needle)

  const popover = page.getByRole('dialog', { name: '向 CiteCiter 提问' })
  await popover.waitFor({ timeout: 8_000 })
  const presenter = popover.getByRole('button', { name: /^讲解 同步整理到小黑板$/u })
  await presenter.click()
  out.presenterSelected = await presenter.getAttribute('aria-pressed')
  await popover.getByLabel('CiteCiter 的第一个问题').fill('请在黑板上讲讲曲率')
  await popover.getByRole('button', { name: '开始讲解', exact: true }).click()

  const panel = page.locator('[data-citeciter-panel]')
  await panel.waitFor({ timeout: 8_000 })
  await page.waitForFunction(() => (
    document.querySelector('[data-citeciter-panel]')?.textContent?.includes('首轮回答：') === true
  ), null, { timeout: 30_000 })
  const panelText = await panel.innerText()
  out.controlBlockHidden = !panelText.includes('<citeciter-board>')
  out.boardToolHidden = !panelText.includes('blackboard_apply')
  out.emptyAssistantRows = await panel.locator('[class*="assistantTurn"]').evaluateAll((nodes) => (
    nodes.filter((node) => node.textContent?.trim() === 'CiteCiter').length
  ))
  out.defaultGeometry = await panel.evaluate((element) => {
    const rail = element.querySelector('nav[aria-label="CiteCiter Topics"]')
    return {
      width: element.getBoundingClientRect().width,
      railVisible: rail instanceof HTMLElement && getComputedStyle(rail).display !== 'none',
    }
  })
  await page.setViewportSize({ width: 1309, height: 818 })
  await page.waitForTimeout(250)
  out.zoomedGeometry = await panel.evaluate((element) => {
    const rail = element.querySelector('nav[aria-label="CiteCiter Topics"]')
    return {
      width: element.getBoundingClientRect().width,
      railVisible: rail instanceof HTMLElement && getComputedStyle(rail).display !== 'none',
    }
  })
  await page.setViewportSize({ width: 1440, height: 900 })

  const separator = panel.getByRole('separator', { name: '调整 CiteCiter 宽度' })
  for (let current = Number(await separator.getAttribute('aria-valuenow')); current < 55; current += 1) {
    await separator.press('ArrowLeft')
  }
  await page.waitForFunction(() => {
    const rail = document.querySelector('nav[aria-label="CiteCiter Topics"]')
    return rail instanceof HTMLElement && getComputedStyle(rail).display !== 'none'
  }, null, { timeout: 8_000 })

  out.wideGeometry = await panel.evaluate((element) => {
    const frame = element.closest('[data-shell-overlay]')?.parentElement
    const rail = element.querySelector('nav[aria-label="CiteCiter Topics"]')
    if (!(frame instanceof HTMLElement) || !(rail instanceof HTMLElement)) return null
    const panelBox = element.getBoundingClientRect()
    const railBox = rail.getBoundingClientRect()
    const columns = getComputedStyle(frame).gridTemplateColumns.split(/\s+/u).filter(Boolean)
    return {
      docked: frame.hasAttribute('data-citeciter-docked') && !element.hasAttribute('data-overlay'),
      threeColumns: columns.length === 3,
      railVisible: railBox.width >= 130,
      railAtRight: Math.abs(railBox.right - panelBox.right) < 2,
    }
  })

  const draft = panel.getByLabel('继续向 CiteCiter 提问')
  await draft.fill('保留这段草稿')
  await page.getByRole('tab', { name: '小黑板', exact: true }).click()
  const board = page.locator('[data-citeciter-board]')
  await board.waitFor({ timeout: 8_000 })
  const curvature = board.locator('[data-board-element="curvature"]')
  await curvature.waitFor({ timeout: 8_000 })
  out.finalElement = await curvature.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      text: element.textContent?.includes('曲率 = 平行移动的路径依赖') === true,
      visible: box.width > 0 && box.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
      focused: element.hasAttribute('data-focused'),
    }
  })
  const markdownSafety = board.locator('[data-board-element="markdown-safety"]')
  await markdownSafety.waitFor({ timeout: 8_000 })
  out.markdownSafety = {
    remoteImages: await markdownSafety.locator('img[src^="http"]').count(),
    ordinaryLinks: await markdownSafety.getByRole('link', { name: '普通链接', exact: true }).count(),
    tables: await markdownSafety.locator('table').count(),
    remoteRequests: remoteBoardRequests.length,
  }
  await curvature.getByRole('button', { name: /引用黑板元素 curvature 到提问/ }).click()
  await page.waitForFunction(() => {
    const input = document.querySelector('[data-citeciter-panel] textarea[aria-label="继续向 CiteCiter 提问"]')
    return input instanceof HTMLTextAreaElement
      && input.value.startsWith('保留这段草稿')
      && input.value.includes('关于黑板上的「曲率 = 平行移动的路径依赖」：')
  })
  out.appendedDraft = await draft.inputValue()
  out.quoteAppended = out.appendedDraft.startsWith('保留这段草稿')
    && out.appendedDraft !== '保留这段草稿'
  await page.screenshot({ path: screenshotPath, fullPage: true })

  for (let current = Number(await separator.getAttribute('aria-valuenow')); current > 28; current -= 1) {
    await separator.press('ArrowRight')
  }
  await page.waitForFunction(() => {
    const rail = document.querySelector('nav[aria-label="CiteCiter Topics"]')
    return rail instanceof HTMLElement && getComputedStyle(rail).display === 'none'
  }, null, { timeout: 8_000 })
  out.narrowGeometry = await panel.evaluate((element) => {
    const rail = element.querySelector('nav[aria-label="CiteCiter Topics"]')
    const compact = element.querySelector('select[aria-label="选择 Topic"]')
    const model = element.querySelector('select[aria-label="CiteCiter 模型"]')
    const effort = element.querySelector('select[aria-label="思考强度"]')
    const archive = element.querySelector('button[aria-label="归档当前 Topic"]')
    const deleteButton = [...element.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === '永久删除')
    const panelBox = element.getBoundingClientRect()
    const controlFits = (control) => {
      if (!(control instanceof HTMLElement)) return false
      const box = control.getBoundingClientRect()
      return box.width > 0 && box.height > 0
        && box.left >= panelBox.left && box.right <= panelBox.right
    }
    return {
      width: element.getBoundingClientRect().width,
      railHidden: rail instanceof HTMLElement && getComputedStyle(rail).display === 'none',
      compactSelectorVisible: compact instanceof HTMLElement && getComputedStyle(compact).display !== 'none',
      modelWidth: model?.getBoundingClientRect().width ?? 0,
      effortWidth: effort?.getBoundingClientRect().width ?? 0,
      toolbarControlsFit: [model, effort, archive, deleteButton].every(controlFits),
    }
  })

  await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).click()
  const compactTopicSelect = panel.getByLabel('选择 Topic')
  await panel.getByRole('button', { name: '查看归档', exact: true }).click()
  await compactTopicSelect.selectOption({ label: '曲率与平行移动' })
  await panel.getByRole('button', { name: '恢复当前 Topic', exact: true }).waitFor({ timeout: 8_000 })
  out.narrowArchiveCanRestore = await panel.getByRole('button', { name: '恢复当前 Topic', exact: true }).isVisible()
  await panel.getByRole('button', { name: '恢复当前 Topic', exact: true }).click()
  await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).waitFor({ timeout: 8_000 })
  out.narrowArchiveRestored = await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).isVisible()
  await panel.getByRole('button', { name: '查看归档', exact: true }).click()
  await panel.getByRole('button', { name: '返回活动', exact: true }).waitFor({ timeout: 8_000 })
  await panel.getByRole('button', { name: '返回活动', exact: true }).click()
  await page.waitForFunction(() => {
    const select = document.querySelector('[data-citeciter-panel] select[aria-label="选择 Topic"]')
    return select instanceof HTMLSelectElement
      && !select.disabled
      && [...select.options].some((option) => option.text === '曲率与平行移动')
  }, null, { timeout: 8_000 })
  await compactTopicSelect.selectOption({ label: '曲率与平行移动' })
  await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).waitFor({ timeout: 8_000 })
  out.narrowReturnedToActive = await panel.getByRole('button', { name: '归档当前 Topic', exact: true }).isVisible()
  await page.screenshot({ path: narrowScreenshotPath, fullPage: true })
} catch (error) {
  out.failure = String(error)
  out.bodyAtFailure = (await page.locator('body').innerText()).slice(0, 1_800)
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
} finally {
  await browser.close()
}

out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && out.dispatch?.defaultPrevented === true
  && out.dispatch?.selectedText === 'Riemann curvature tensor measures how parallel transport'
  && out.presenterSelected === 'true'
  && out.controlBlockHidden === true
  && out.boardToolHidden === true
  && out.emptyAssistantRows === 0
  && out.defaultGeometry?.railVisible === true
  && out.zoomedGeometry?.railVisible === true
  && out.wideGeometry?.docked === true
  && out.wideGeometry?.threeColumns === true
  && out.wideGeometry?.railVisible === true
  && out.wideGeometry?.railAtRight === true
  && out.finalElement?.text === true
  && out.finalElement?.visible === true
  && out.finalElement?.focused === true
  && out.markdownSafety?.remoteImages === 0
  && out.markdownSafety?.ordinaryLinks === 1
  && out.markdownSafety?.tables === 1
  && out.markdownSafety?.remoteRequests === 0
  && out.quoteAppended === true
  && out.narrowGeometry?.width < 620
  && out.narrowGeometry?.railHidden === true
  && out.narrowGeometry?.compactSelectorVisible === true
  && out.narrowGeometry?.modelWidth >= 110
  && out.narrowGeometry?.effortWidth >= 110
  && out.narrowGeometry?.toolbarControlsFit === true
  && out.narrowArchiveCanRestore === true
  && out.narrowArchiveRestored === true
  && out.narrowReturnedToActive === true
  && out.errors.length === 0
console.log(JSON.stringify(out, null, 2))
process.exitCode = out.passed ? 0 : 1
