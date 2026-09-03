/** Keyless assembled-Web smoke for update notification actions and responsive layout. */
import { resolve } from 'node:path'

const { chromium } = await import(process.env.PLAYWRIGHT_PATH ?? 'playwright')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3907'
const installedVersion = process.argv[3]
const latestVersion = process.argv[4]
const screenshotPath = resolve(process.argv[5] ?? `/tmp/citeciter-update-smoke-${process.pid}.png`)

if (installedVersion === undefined || latestVersion === undefined) {
  throw new Error('usage: node dev/smoke-update.mjs <url> <installed-version> <latest-version> [screenshot-under-/tmp]')
}
if (!screenshotPath.startsWith('/tmp/')) throw new Error('the smoke screenshot must stay under /tmp')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const errors = []
const out = { screenshotPath, errors }

function watch(page) {
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
}

async function openPage() {
  const page = await context.newPage()
  watch(page)
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 })
  const notice = page.locator('[data-citeciter-update-notice]')
  await notice.waitFor({ timeout: 8_000 })
  return { page, notice }
}

try {
  const first = await openPage()
  out.initial = {
    title: await first.notice.getByRole('heading', { name: 'CiteCiter 有新版本' }).innerText(),
    text: await first.notice.innerText(),
    buttons: await first.notice.getByRole('button').allTextContents(),
  }
  await first.notice.getByRole('button', { name: '更新', exact: true }).click()
  const copyFeedback = first.notice.locator('[data-status]').filter({ hasText: /更新命令|自动复制/u })
  await copyFeedback.waitFor({ timeout: 5_000 })
  out.copyFeedback = await copyFeedback.innerText()
  await first.notice.getByRole('button', { name: '下次一定', exact: true }).click()
  await first.notice.waitFor({ state: 'detached' })
  await first.page.reload({ waitUntil: 'domcontentloaded' })
  await first.page.waitForTimeout(500)
  out.deferredAfterReload = await first.page.locator('[data-citeciter-update-notice]').count()

  const second = await openPage()
  await second.notice.getByRole('button', { name: '不再提示', exact: true }).click()
  await second.notice.waitFor({ state: 'detached' })
  await second.page.reload({ waitUntil: 'domcontentloaded' })
  await second.page.waitForTimeout(500)
  out.disabledAfterReload = await second.page.locator('[data-citeciter-update-notice]').count()

  await second.page.getByRole('button', { name: /^(Settings|设置)$/u }).click()
  await second.page.getByRole('button', { name: 'CiteCiter', exact: true }).click()
  const toggle = second.page.getByRole('checkbox', { name: /版本更新提醒/u })
  out.disabledInSettings = !await toggle.isChecked()
  await toggle.click()
  await second.page.getByRole('status').filter({ hasText: '已开启版本更新提醒' }).waitFor({ timeout: 5_000 })
  await second.page.getByRole('button', { name: /^(Close|关闭)$/u }).click()
  await second.page.locator('[data-citeciter-update-notice]').waitFor({ timeout: 5_000 })
  out.restored = true

  for (const width of [480, 360]) {
    await second.page.setViewportSize({ width, height: 800 })
    await second.page.waitForTimeout(200)
    out[`width${width}`] = await second.page.locator('[data-citeciter-update-notice]').evaluate((element) => {
      const card = element.getBoundingClientRect()
      return {
        card: { left: Math.round(card.left), right: Math.round(card.right) },
        buttons: [...element.querySelectorAll('button')].map((button) => {
          const box = button.getBoundingClientRect()
          return { text: button.textContent, y: Math.round(box.y), height: Math.round(box.height) }
        }),
      }
    })
  }
  await second.page.screenshot({ path: screenshotPath, fullPage: true })
} catch (error) {
  out.failure = String(error)
} finally {
  await context.close()
  await browser.close()
}

const expectedCommand = `dsh plugin --profile web add @kirkchinese/dsh-citeciter@${latestVersion}`
out.errors = errors.slice(0, 10)
out.passed = out.failure === undefined
  && out.initial?.title === 'CiteCiter 有新版本'
  && out.initial?.text.includes(`v${installedVersion}`)
  && out.initial?.text.includes(`v${latestVersion}`)
  && out.initial?.text.includes(expectedCommand)
  && out.initial?.text.includes('自定义 Web Profile 请替换命令中的 web')
  && JSON.stringify(out.initial?.buttons) === JSON.stringify(['更新', '下次一定', '不再提示'])
  && /已复制|手动复制/u.test(out.copyFeedback ?? '')
  && out.deferredAfterReload === 0
  && out.disabledAfterReload === 0
  && out.disabledInSettings === true
  && out.restored === true
  && out.width480?.card.left === 12
  && out.width480?.card.right === 468
  && out.width480?.buttons.every((button) => button.height >= 44)
  && out.width480?.buttons[1]?.y === out.width480?.buttons[2]?.y
  && out.width360?.card.left === 12
  && out.width360?.card.right === 348
  && out.width360?.buttons.every((button) => button.height >= 44)
  && new Set(out.width360?.buttons.map((button) => button.y)).size === 3
  && out.errors.length === 0
console.log(JSON.stringify(out, null, 2))
process.exitCode = out.passed ? 0 : 1
