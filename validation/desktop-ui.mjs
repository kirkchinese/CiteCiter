import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const endpoint = process.argv[2]
const action = process.argv[3]
const expectedPort = process.argv[4]
const outputPath = resolve(process.argv[5] ?? 'desktop-ui.json')
const screenshotPath = resolve(process.argv[6] ?? 'desktop-ui.png')
const actions = ['create-compatibility', 'verify-compatibility', 'verify-advanced']
if (endpoint === undefined || !actions.includes(action)) {
  throw new Error('usage: node desktop-ui.mjs <cdp-url> <create-compatibility|verify-compatibility|verify-advanced> <port|random> <output.json> <screenshot.png>')
}

const playwrightRoot = process.env.PLAYWRIGHT_CORE_ROOT
if (playwrightRoot === undefined) throw new Error('PLAYWRIGHT_CORE_ROOT is required')
const { chromium } = createRequire(import.meta.url)(resolve(playwrightRoot, 'node_modules', 'playwright-core'))
const sourceText = 'The Riemann curvature tensor measures how parallel transport depends on path.'
const question = '为什么平行移动能检测曲率？'
const fallbackQuestion = '路径依赖与曲率之间是什么关系？'
const answer = '首轮回答：平行移动比较同一向量沿不同路径返回后的差异；这个差异由曲率刻画。'

async function connect() {
  const deadline = Date.now() + 90_000
  let failure
  while (Date.now() < deadline) {
    try {
      return await chromium.connectOverCDP(endpoint)
    } catch (cause) {
      failure = cause
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  throw failure
}

async function dismissOptionalPrompts(page) {
  for (const name of ['稍后配置', '继续', 'Configure later', 'Continue']) {
    const button = page.getByRole('button', { name })
    if (await button.count() > 0) await button.first().click({ force: true }).catch(() => {})
  }
}

async function openSource(page) {
  await dismissOptionalPrompts(page)
  const ungrouped = page.getByText('未分组', { exact: true }).first()
  if (await ungrouped.count() > 0) await ungrouped.click({ force: true }).catch(() => {})
  const expand = page.getByRole('button', { name: /展开其余|Show remaining/u }).first()
  if (await expand.count() > 0) await expand.click({ force: true }).catch(() => {})
  const row = page.getByRole('treeitem').filter({ hasText: 'CiteCiter' }).first()
  await row.waitFor({ timeout: 30_000 })
  const flow = page.locator('[data-chat-flow-kind="assistant-step"]').last()
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await row.click({ force: true })
    if (await flow.waitFor({ timeout: 8_000 }).then(() => true, () => false)) return flow
  }
  throw new Error('seeded source session did not render')
}

function selectSourceText(needle) {
  const flow = [...document.querySelectorAll('[data-chat-flow-kind="assistant-step"]')]
    .find(candidate => candidate.textContent?.includes(needle))
  if (!(flow instanceof HTMLElement)) throw new Error('assistant source row is missing')
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node !== null && !node.data.includes(needle)) node = walker.nextNode()
  if (node === null) throw new Error('assistant source text node is missing')
  const start = node.data.indexOf(needle)
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, start + needle.length)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  const box = range.getBoundingClientRect()
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: Math.max(24, box.left),
    clientY: Math.max(24, Math.min(box.bottom, window.innerHeight - 280)),
  })
  return { defaultPrevented: !flow.dispatchEvent(event), selectedText: selection.toString() }
}

async function assertAdvancedLayout(page) {
  return await page.locator('[data-citeciter-panel]').evaluate((panel, expectedSource) => {
    const overlay = panel.closest('[data-shell-overlay]')
    const root = overlay?.parentElement
    const details = overlay?.previousElementSibling
    const conversation = details?.previousElementSibling
    const caption = root?.querySelector(':scope > .dshDesktopMacCaptionRow, :scope > .dshDesktopWindowsCaptionRow')
    const handle = root?.querySelector(':scope > [data-side="details"]')
    if (!(root instanceof HTMLElement) || !(overlay instanceof HTMLElement)
      || !(details instanceof HTMLElement) || !(conversation instanceof HTMLElement)
      || !(caption instanceof HTMLElement)) {
      throw new Error('Desktop AdvancedFrame direct-child structure is missing')
    }
    const rootStyle = getComputedStyle(root)
    const conversationStyle = getComputedStyle(conversation)
    const detailsStyle = getComputedStyle(details)
    const captionStyle = getComputedStyle(caption)
    const handleStyle = handle instanceof HTMLElement ? getComputedStyle(handle) : undefined
    const conversationRect = conversation.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const result = {
      rootClass: root.className,
      gridTemplateColumns: rootStyle.gridTemplateColumns,
      dockOwner: root.hasAttribute('data-citeciter-docked'),
      overlayFollowsDetails: details.nextElementSibling === overlay,
      conversationClass: conversation.className,
      conversationVisibility: conversationStyle.visibility,
      conversationDisplay: conversationStyle.display,
      conversationWidth: conversationRect.width,
      conversationContainsSource: conversation.textContent?.includes(expectedSource) === true,
      detailsVisibility: detailsStyle.visibility,
      captionVisibility: captionStyle.visibility,
      detailsHandlePresent: handle instanceof HTMLElement,
      detailsHandleDisplay: handleStyle?.display ?? null,
      panelWidth: panelRect.width,
      conversationRight: conversationRect.right,
      panelLeft: panelRect.left,
    }
    if (!result.dockOwner || !result.overlayFollowsDetails
      || result.conversationVisibility !== 'visible' || result.conversationDisplay === 'none'
      || result.conversationWidth <= 0 || !result.conversationContainsSource
      || result.detailsVisibility !== 'hidden' || result.captionVisibility !== 'visible'
      || (result.detailsHandlePresent && result.detailsHandleDisplay !== 'none') || result.panelWidth <= 0
      || result.conversationRight > result.panelLeft + 1) {
      throw new Error(`AdvancedFrame visibility assertion failed: ${JSON.stringify(result)}`)
    }
    return result
  }, sourceText)
}

async function createTopic(page, questionText) {
  const selection = await page.evaluate(selectSourceText, sourceText)
  if (!selection.defaultPrevented || selection.selectedText !== sourceText) {
    throw new Error(`selection was not claimed: ${JSON.stringify(selection)}`)
  }
  const popover = page.getByRole('dialog', { name: '向 CiteCiter 提问' })
  await popover.waitFor({ timeout: 10_000 })
  await popover.getByLabel('CiteCiter 的第一个问题').fill(questionText)
  await popover.getByRole('button', { name: 'Citer!', exact: true }).click()
  await page.waitForFunction(({ expectedQuestion, expectedAnswer }) => {
    const text = document.querySelector('[data-citeciter-panel]')?.textContent ?? ''
    return text.includes(expectedQuestion) && text.includes(expectedAnswer)
  }, { expectedQuestion: questionText, expectedAnswer: answer }, { timeout: 45_000 })
  return selection
}

const browser = await connect()
const errors = []
let page
try {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline && page === undefined) {
    page = browser.contexts().flatMap(context => context.pages())
      .find(candidate => /^http:\/\/127\.0\.0\.1:\d+\//u.test(candidate.url()))
    if (page === undefined) await new Promise(resolve => setTimeout(resolve, 250))
  }
  if (page === undefined) throw new Error('Desktop loopback renderer page was not exposed over CDP')
  page.on('pageerror', error => errors.push(String(error)))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.waitForLoadState('domcontentloaded')
  const flow = await openSource(page)
  let selection
  if (action === 'create-compatibility') {
    const primary = await createTopic(page, question)
    const panel = page.locator('[data-citeciter-panel]')
    const primaryTopicId = await panel.locator('[data-citeciter-topic][data-active]').getAttribute('data-citeciter-topic')
    const fallback = await createTopic(page, fallbackQuestion)
    await page.waitForFunction(() => document.querySelectorAll('[data-citeciter-topic]').length >= 2)
    const fallbackTopicId = await panel.locator('[data-citeciter-topic][data-active]').getAttribute('data-citeciter-topic')
    if (primaryTopicId === null || fallbackTopicId === null || primaryTopicId === fallbackTopicId) {
      throw new Error(`two distinct Topics were not created: ${primaryTopicId}, ${fallbackTopicId}`)
    }
    await panel.locator('[data-citeciter-topic]').evaluateAll((buttons, sessionId) => {
      const target = buttons.find(button => button.getAttribute('data-citeciter-topic') === sessionId)
      if (!(target instanceof HTMLButtonElement)) throw new Error(`Topic ${sessionId} is missing`)
      target.click()
    }, primaryTopicId)
    await page.waitForFunction(({ sessionId, expectedQuestion }) => {
      const active = document.querySelector('[data-citeciter-topic][data-active]')
      const text = document.querySelector('[data-citeciter-panel]')?.textContent ?? ''
      return active?.getAttribute('data-citeciter-topic') === sessionId && text.includes(expectedQuestion)
    }, { sessionId: primaryTopicId, expectedQuestion: question })
    selection = { primary, fallback, primaryTopicId, fallbackTopicId }
  } else {
    const panel = page.locator('[data-citeciter-panel]')
    if (!await panel.waitFor({ timeout: 20_000 }).then(() => true, () => false)) {
      const launcher = page.getByRole('button', { name: /打开 CiteCiter|Open CiteCiter/u }).first()
      await launcher.waitFor({ timeout: 10_000 })
      await launcher.click()
    }
  }

  const panel = page.locator('[data-citeciter-panel]')
  await panel.waitFor({ timeout: 20_000 })
  const expectedQuestion = expectedPort === 'random' ? fallbackQuestion : question
  await page.waitForFunction(({ expectedQuestion, expectedAnswer }) => {
    const text = document.querySelector('[data-citeciter-panel]')?.textContent ?? ''
    return text.includes(expectedQuestion) && text.includes(expectedAnswer)
  }, { expectedQuestion, expectedAnswer: answer }, { timeout: 45_000 })

  const url = new URL(page.url())
  const actualMode = url.searchParams.get('dsh-desktop-mode')
  const actualPort = Number(url.port)
  const expectedMode = action === 'verify-advanced' ? 'advanced' : 'compatibility'
  if (actualMode !== expectedMode) throw new Error(`expected ${expectedMode} mode, received ${actualMode}`)
  if (expectedPort === 'random') {
    if (!Number.isInteger(actualPort) || actualPort < 1 || actualPort === 43189) {
      throw new Error(`invalid random port ${url.port}`)
    }
  } else if (actualPort !== Number(expectedPort)) {
    throw new Error(`expected loopback port ${expectedPort}, received ${url.port}`)
  }

  const layout = action === 'verify-advanced' ? await assertAdvancedLayout(page) : null
  const topicOrder = await panel.locator('[data-citeciter-topic]').evaluateAll(buttons => buttons.map(button => ({
    sessionId: button.getAttribute('data-citeciter-topic'),
    active: button.hasAttribute('data-active'),
  })))
  const activeTopicIndex = topicOrder.findIndex(topic => topic.active)
  const expectedActiveIndex = expectedPort === 'random' ? 0 : 1
  if (topicOrder.length !== 2 || activeTopicIndex !== expectedActiveIndex) {
    throw new Error(`Topic restoration assertion failed: ${JSON.stringify({ expectedActiveIndex, topicOrder })}`)
  }
  await page.waitForTimeout(500)
  const result = {
    action,
    url: page.url(),
    actualPort,
    selection,
    sourceVisible: await flow.isVisible(),
    topicCount: topicOrder.length,
    topicOrder,
    activeTopicIndex,
    restoration: expectedPort === 'random' ? 'most-recent fallback' : 'fixed-origin exact pointer',
    layout,
    consoleErrors: errors.slice(0, 20),
  }
  if (!result.sourceVisible || result.topicCount < 1
    || (action !== 'create-compatibility' && errors.length > 0)) {
    throw new Error(`invalid UI result: ${JSON.stringify(result)}`)
  }
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify(result))
} catch (cause) {
  console.error(cause instanceof Error ? cause.stack ?? cause.message : String(cause))
  process.exit(1)
}
process.exit(0)
