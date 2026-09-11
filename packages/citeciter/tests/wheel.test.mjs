import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_WHEEL_SLOTS, actionQuestion, wheelSlotsSchema } from '../lib/types/actions.js'
import { citeCiterSettingsSchema } from '../lib/types/topic.js'
import { CITECITER_SETTINGS_SCHEMA } from '../lib/types/index.js'
import { createActionController, wheelSector } from '../lib/types/client/action-controller.js'
import { createActionExecutor } from '../lib/types/client/action-executor.js'
import { decodeNativeText, nativeDocumentSource } from '../lib/types/client/native-document.js'
import { claimCreateDocumentIntent, claimCreateTopicIntent } from '../lib/types/client/request-guard.js'
import { documentPages, DOCUMENT_CONTENT_MAX_BYTES } from '../lib/types/document-pages.js'

const source = { kind: 'document', sourceSessionId: 'source', title: 'notes.md', content: 'before quote after', displayText: 'quote', prefixText: 'before ', suffixText: ' after' }
const tick = () => new Promise(resolve => setImmediate(resolve))

test('native and imported readers share lossless UTF-8 pagination', () => {
  const content = 'a'.repeat(DOCUMENT_CONTENT_MAX_BYTES - 1) + '🙂中'.repeat(100000)
  const pages = documentPages(content)
  assert.equal(pages.join(''),content)
  assert.ok(pages.length > 1)
  for (const page of pages) { assert.ok(Buffer.byteLength(page) <= DOCUMENT_CONTENT_MAX_BYTES); assert.equal(page.isWellFormed(),true) }
})

test('wheel and its caption fit a small viewport and scaled hit testing uses the displayed centre', async t => {
  viewport(t); window.innerWidth=320;window.innerHeight=240
  const controller=createActionController(async()=>{})
  controller.open(source,319,239,DEFAULT_WHEEL_SLOTS,true)
  const wheel=controller.getSnapshot().wheel
  assert.ok(wheel.x+180*wheel.scale<=320)
  assert.ok(wheel.y+220*wheel.scale<=240)
  controller.move(wheel.x+100*wheel.scale,wheel.y)
  assert.equal(controller.getSnapshot().wheel.active,2)
  await controller.dispose()
})
function viewport(t) { const before = globalThis.window; globalThis.window = { innerWidth: 1200, innerHeight: 800 }; t.after(() => { if (before === undefined) delete globalThis.window; else globalThis.window = before }) }

test('eight directions keep fixed positions; centre and outside cancel', () => {
  for (let i = 0; i < 8; i++) { const angle = (i * 45 - 90) * Math.PI / 180; assert.equal(wheelSector(Math.cos(angle)*110, Math.sin(angle)*110), i) }
  assert.equal(wheelSector(0,0),null)
  assert.equal(wheelSector(41,0),null)
  assert.equal(wheelSector(181,0),null)
})

test('old settings get valid Host defaults and empty slots preserve all eight positions', () => {
  const resolved = CITECITER_SETTINGS_SCHEMA({})
  assert.equal(citeCiterSettingsSchema.safeParse(resolved).success,true)
  assert.equal(resolved.defaultCiterModel ?? null,null)
  assert.equal(resolved.wheelTrigger,'right-button')
  assert.deepEqual(resolved.wheelSlots,DEFAULT_WHEEL_SLOTS)
  assert.equal(wheelSlotsSchema.safeParse(Array(8).fill(null)).success,true)
  assert.equal(wheelSlotsSchema.safeParse(DEFAULT_WHEEL_SLOTS.slice(0,7)).success,false)
  assert.equal(wheelSlotsSchema.safeParse([{...DEFAULT_WHEEL_SLOTS[0],ask:false},...DEFAULT_WHEEL_SLOTS.slice(1)]).success,false)
})

test('hold/release executes exactly once with the configured model and durable prompt', async t => {
  viewport(t)
  const calls=[]; let finish
  const controller=createActionController((...args) => { calls.push(args); return new Promise(resolve => { finish=resolve }) },()=>({provider:'p',model:'default'}))
  controller.open(source,1,1,DEFAULT_WHEEL_SLOTS,true)
  const wheel=controller.getSnapshot().wheel
  assert.ok(wheel.x>=180 && wheel.y>=180)
  controller.move(wheel.x+80,wheel.y-80)
  controller.release(false)
  controller.release(false)
  await controller.submit()
  assert.equal(calls.length,1)
  assert.equal(calls[0][2],DEFAULT_WHEEL_SLOTS[1].prompt)
  assert.deepEqual(calls[0][3],{provider:'p',model:'default'})
  finish(); await tick()
  assert.equal(controller.getSnapshot().pending,null)
  await controller.dispose()
})

test('prompt modes wait for input; retry retains question, selected model and captured source', async t => {
  viewport(t); const calls=[]; let fails=true
  const controller=createActionController(async (...args)=>{ calls.push(args); if(fails) throw new Error('offline') })
  controller.open(source,400,300,DEFAULT_WHEEL_SLOTS,true)
  controller.choose(0)
  assert.equal(calls.length,0)
  await controller.submit(); assert.equal(calls.length,0)
  controller.setQuestion('why?'); controller.setModel({provider:'p',model:'selected'})
  await controller.submit()
  assert.equal(controller.getSnapshot().question,'why?')
  assert.equal(controller.getSnapshot().error,'offline')
  assert.deepEqual(calls[0][3],{provider:'p',model:'selected'})
  fails=false; await controller.submit()
  assert.equal(calls[1][2],actionQuestion(DEFAULT_WHEEL_SLOTS[0],'why?'))
  assert.equal(controller.getSnapshot().pending,null)
  await controller.dispose()
})

test('quick centre click latches, long centre/empty slots/cancellation never dispatch', async t => {
  viewport(t); let calls=0
  const controller=createActionController(async()=>{ calls++ })
  controller.open(source,400,300,DEFAULT_WHEEL_SLOTS,true); controller.release(true)
  assert.equal(controller.getSnapshot().wheel.held,false)
  controller.release(false); assert.equal(controller.getSnapshot().wheel,null)
  controller.open(source,400,300,DEFAULT_WHEEL_SLOTS,true); controller.choose(7)
  assert.equal(controller.getSnapshot().wheel,null)
  controller.open(source,400,300,DEFAULT_WHEEL_SLOTS,true); controller.cancel(); controller.release(false)
  assert.equal(calls,0)
  await controller.dispose()
})

test('file snapshots retain full text and their address Session; invalid/partial content is rejected', () => {
  const text='首段\n'+ '原文'.repeat(300000)+'\n末尾'
  assert.equal(decodeNativeText({kind:'bytes',data:new TextEncoder().encode(text)}),text)
  const capture=nativeDocumentSource('dsh-resource://file/session/file-session/docs/a%20b.md',text,{displayText:'末尾',prefixText:'\n',suffixText:''})
  assert.equal(capture.sourceSessionId,'file-session')
  assert.equal(capture.title,'docs/a b.md')
  assert.equal(capture.content,text)
  assert.throws(()=>decodeNativeText({kind:'text',text:'prefix',eof:false}),/完整/)
  assert.throws(()=>decodeNativeText({kind:'bytes',data:new Uint8Array([0xff])}))
  assert.throws(()=>decodeNativeText({kind:'bytes',data:new Uint8Array([0])}),/UTF-8/)
  assert.throws(()=>nativeDocumentSource('dsh-resource://file/absolute/tmp/a.txt','a',{}),/来源会话/)
})

test('document retry reuses its import; source changes during import never create under the new Session', async () => {
  let current='source', imported=0, created=0, fail=true, closed=0, swap=false
  const companion={ getSnapshot:()=>({sourceSessionId:current}), createFromDocument:async(_claim,_question,id,model)=>{assert.equal(id,'source');assert.equal(model.model,'chosen');created++;if(fail)throw new Error('retry')} }
  const reader={ importFile:async()=>{imported++;if(swap)current='other';return{documentId:'saved'}},setOpen:()=>{closed++},getSnapshot:()=>({error:null}) }
  const execute=createActionExecutor(companion,reader,()=>{})
  await assert.rejects(execute(source,DEFAULT_WHEEL_SLOTS[1],'ask',{provider:'p',model:'chosen'}),/retry/)
  assert.equal(closed,0);fail=false
  await execute(source,DEFAULT_WHEEL_SLOTS[1],'ask',{provider:'p',model:'chosen'})
  assert.equal(imported,1);assert.equal(created,2);assert.equal(closed,1)
  swap=true
  await assert.rejects(execute({...source},DEFAULT_WHEEL_SLOTS[1],'ask',{provider:'p',model:'chosen'}),/来源会话已切换/)
  assert.equal(created,2)
})

test('request retries distinguish model choices and document source Sessions', async () => {
  const claim={documentId:'doc',displayText:'quote',prefixText:'',suffixText:''}
  const a=await claimCreateDocumentIntent(claim,'why','a',{provider:'p',model:'a'})
  const b=await claimCreateDocumentIntent(claim,'why','b',{provider:'p',model:'a'})
  const c=await claimCreateDocumentIntent(claim,'why','a',{provider:'p',model:'b'})
  assert.notEqual(a.key,b.key); assert.notEqual(a.key,c.key)
  const selected={kind:'assistant-step',sourceSessionId:'a',anchorKey:'anchor',startOffset:0,endOffset:1,displayText:'x',prefixText:'',suffixText:''}
  const x=await claimCreateTopicIntent(selected,'why','observer','qa',{provider:'p',model:'a'})
  const y=await claimCreateTopicIntent(selected,'why','observer','qa',{provider:'p',model:'b'})
  assert.notEqual(x.key,y.key)
})
