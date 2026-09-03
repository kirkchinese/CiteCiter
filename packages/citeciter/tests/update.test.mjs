import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CITECITER_NPM_LATEST_URL,
  UPDATE_CHECK_TTL_MS,
  UpdateChecker,
  compareStableVersions,
  updateCheckResponseSchema,
} from '../lib/types/update.js'

function registryResponse(version, init) {
  return new Response(JSON.stringify({ name: '@kirkchinese/dsh-citeciter', version }), init)
}

test('stable version comparison is numeric and rejects non-stable input', () => {
  assert.equal(compareStableVersions('0.10.0', '0.9.9'), 1)
  assert.equal(compareStableVersions('1.2.3', '1.2.3'), 0)
  assert.equal(compareStableVersions('1.2.3', '2.0.0'), -1)
  assert.equal(compareStableVersions('01.2.3', '1.2.3'), null)
  assert.equal(compareStableVersions('1.2.3-rc.1', '1.2.3'), null)
  assert.equal(compareStableVersions('1.2.3+build', '1.2.3'), null)
  assert.equal(compareStableVersions('9007199254740992.0.0', '1.0.0'), null)
})

test('update checker uses the fixed registry URL and caches only successful checks', async () => {
  let calls = 0
  let now = 1_000
  const checker = new UpdateChecker(async (input, init) => {
    calls += 1
    assert.equal(input, CITECITER_NPM_LATEST_URL)
    assert.equal(init?.method, 'GET')
    assert.equal(init?.redirect, 'error')
    return registryResponse('0.10.0')
  }, () => now, async () => '0.4.3')

  const first = await checker.check(new AbortController().signal)
  assert.deepEqual(first, {
    kind: 'success',
    installedVersion: '0.4.3',
    latestVersion: '0.10.0',
    updateAvailable: true,
    checkedAt: 1_000,
  })
  assert.deepEqual(updateCheckResponseSchema.parse(first), first)

  now += UPDATE_CHECK_TTL_MS - 1
  assert.equal(await checker.check(new AbortController().signal), first)
  assert.equal(calls, 1)

  now += 2
  await checker.check(new AbortController().signal)
  assert.equal(calls, 2)
})

test('update checker reads the installed version from the package manifest', async () => {
  const checker = new UpdateChecker(async () => registryResponse('0.5.0'), () => 1_500)
  assert.deepEqual(await checker.check(new AbortController().signal), {
    kind: 'success',
    installedVersion: '0.5.0',
    latestVersion: '0.5.0',
    updateAvailable: false,
    checkedAt: 1_500,
  })
})

test('update checker fails closed for invalid versions and does not cache failures', async () => {
  let calls = 0
  const checker = new UpdateChecker(async () => {
    calls += 1
    return registryResponse('0.5.0-rc.1')
  }, () => 2_000, async () => '0.4.3')

  assert.deepEqual(await checker.check(new AbortController().signal), {
    kind: 'error', code: 'registry-version-invalid', checkedAt: 2_000,
  })
  await checker.check(new AbortController().signal)
  assert.equal(calls, 2)

  const invalidInstalled = new UpdateChecker(async () => registryResponse('0.5.0'), () => 3_000, async () => 'dev')
  assert.deepEqual(await invalidInstalled.check(new AbortController().signal), {
    kind: 'error', code: 'installed-version-invalid', checkedAt: 3_000,
  })
})

test('update checker classifies HTTP, invalid, oversized, and network responses', async () => {
  const cases = [
    [async () => new Response('', { status: 503 }), 'registry-http'],
    [async () => new Response('{'), 'registry-response-invalid'],
    [async () => new Response('{}'), 'registry-response-invalid'],
    [async () => new Response('x', { headers: { 'content-length': '65537' } }), 'registry-response-too-large'],
    [async () => new Response('x'.repeat(65_537)), 'registry-response-too-large'],
    [async () => { throw new Error('offline') }, 'registry-network'],
  ]
  for (const [fetchImpl, code] of cases) {
    const checker = new UpdateChecker(fetchImpl, () => 4_000, async () => '0.4.3')
    assert.deepEqual(await checker.check(new AbortController().signal), { kind: 'error', code, checkedAt: 4_000 })
  }
})

test('update checker preserves caller cancellation', async () => {
  const controller = new AbortController()
  const reason = new Error('caller stopped')
  controller.abort(reason)
  const checker = new UpdateChecker(async () => registryResponse('0.5.0'), Date.now, async () => '0.4.3')
  await assert.rejects(checker.check(controller.signal), (error) => error === reason)
})

test('concurrent callers share one bounded fetch without sharing cancellation', async () => {
  let calls = 0
  let release
  const response = new Promise((resolve) => { release = resolve })
  const checker = new UpdateChecker(async () => {
    calls += 1
    return response
  }, () => 5_000, async () => '0.4.3')
  const cancelled = new AbortController()
  const reason = new Error('one caller left')
  const first = checker.check(cancelled.signal)
  const second = checker.check(new AbortController().signal)
  cancelled.abort(reason)
  await assert.rejects(first, (error) => error === reason)
  release(registryResponse('0.5.0'))
  assert.equal((await second).updateAvailable, true)
  assert.equal(calls, 1)
})

test('responses rejected before reading release their bodies', async () => {
  let cancels = 0
  const body = () => new ReadableStream({ cancel: () => { cancels += 1 } })
  const http = new UpdateChecker(async () => new Response(body(), { status: 503 }), () => 6_000, async () => '0.4.3')
  const oversized = new UpdateChecker(async () => new Response(body(), {
    headers: { 'content-length': '65537' },
  }), () => 6_000, async () => '0.4.3')

  assert.equal((await http.check(new AbortController().signal)).code, 'registry-http')
  assert.equal((await oversized.check(new AbortController().signal)).code, 'registry-response-too-large')
  assert.equal(cancels, 2)
})
