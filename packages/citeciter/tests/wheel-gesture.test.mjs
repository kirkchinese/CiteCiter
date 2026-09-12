import assert from 'node:assert/strict'
import test from 'node:test'
import { createActionController } from '../lib/types/client/action-controller.js'
import { installWheelGesture } from '../lib/types/client/wheel-gesture.js'

function setup(t) {
  const names=['window','document','Element']; const old=names.map(name=>Object.getOwnPropertyDescriptor(globalThis,name))
  class Element { constructor(editable=false){ this.editable=editable } closest(selector){ return this.editable && selector.includes('textarea:not') ? this : null } }
  const target=new Element()
  const document=new EventTarget(), window=new EventTarget()
  window.innerWidth=1200;window.innerHeight=800;document.elementFromPoint=()=>target
  for(const [name,value] of Object.entries({window,document,Element}))Object.defineProperty(globalThis,name,{value,configurable:true})
  t.after(()=>names.forEach((name,i)=>{if(old[i])Object.defineProperty(globalThis,name,old[i]);else delete globalThis[name]}))
  const emit=(where,type,fields={})=>{const event=new Event(type,{cancelable:true});for(const [key,value]of Object.entries({target,clientX:500,clientY:350,button:2,...fields}))Object.defineProperty(event,key,{value});where.dispatchEvent(event);return event}
  return{window,document,target,Element,emit}
}
const source={kind:'document',sourceSessionId:'a',documentId:'doc',title:'x',displayText:'quote',prefixText:'',suffixText:''}

test('question drafts survive blur, resize, pointer cancellation and outside clicks until explicit cancellation',async t=>{
  const h=setup(t), calls=[]
  const controller=createActionController(async(...args)=>{calls.push(args)})
  const dispose=installWheelGesture(controller,()=>source,()=>({}))
  h.emit(h.document,'contextmenu');controller.choose(0)
  controller.setQuestion('为什么？');controller.setModel({provider:'fixture',model:'fixture-alt'})
  const pending=controller.getSnapshot().pending
  for(const [where,type,fields] of [[h.window,'blur'],[h.window,'resize'],[h.document,'pointercancel'],[h.document,'pointerdown',{button:0}]]){
    h.emit(where,type,fields)
    assert.deepEqual(controller.getSnapshot().pending,pending,type)
    assert.equal(controller.getSnapshot().question,'为什么？',type)
    assert.deepEqual(controller.getSnapshot().model,{provider:'fixture',model:'fixture-alt'},type)
  }
  h.emit(h.document,'pointerdown');h.emit(h.document,'pointerup')
  assert.deepEqual(controller.getSnapshot().pending,pending,'another gesture does not discard the draft')
  await controller.submit()
  assert.equal(calls.length,1);assert.equal(calls[0][2],'我的问题：为什么？')
  assert.deepEqual(calls[0][3],{provider:'fixture',model:'fixture-alt'})
  controller.open(source,500,350,[pending.action],false);controller.choose(0);controller.setQuestion('取消')
  h.emit(h.document,'keydown',{key:'Escape'})
  assert.equal(controller.getSnapshot().pending,null);assert.equal(controller.getSnapshot().question,'')
  dispose();await controller.dispose()
})

test('right-button down/move/up executes once; following native contextmenu is suppressed',async t=>{
  const h=setup(t), calls=[]
  const controller=createActionController(async(...args)=>{calls.push(args)})
  const dispose=installWheelGesture(controller,()=>source,()=>({}))
  assert.equal(h.emit(h.document,'pointerdown').defaultPrevented,true)
  h.emit(h.document,'contextmenu')
  h.emit(h.document,'pointermove',{clientX:600,clientY:350})
  h.emit(h.document,'pointerup')
  assert.equal(h.emit(h.document,'contextmenu').defaultPrevented,true)
  await new Promise(resolve=>setImmediate(resolve))
  assert.equal(calls.length,1);assert.equal(calls[0][1].label,'找错误')
  dispose();await controller.dispose()
})

test('native context menus survive uncitable content and Shift-right-click; blur and disposal cancel held actions',async t=>{
  const h=setup(t);let citable=false,calls=0
  const controller=createActionController(async()=>{calls++})
  const dispose=installWheelGesture(controller,()=>citable?source:null,()=>({}))
  assert.equal(h.emit(h.document,'contextmenu').defaultPrevented,false)
  citable=true
  assert.equal(h.emit(h.document,'contextmenu',{shiftKey:true}).defaultPrevented,false)
  h.emit(h.document,'pointerdown');h.emit(h.document,'pointermove',{clientX:600});h.emit(h.window,'blur');h.emit(h.document,'pointerup')
  assert.equal(calls,0)
  h.emit(h.document,'pointerdown');dispose();h.emit(h.document,'pointermove',{clientX:600});h.emit(h.document,'pointerup')
  assert.equal(calls,0);assert.equal(controller.getSnapshot().wheel,null)
  await controller.dispose()
})

test('configured hold key preserves editable fields and modifier chords; key release dispatches the selected action',async t=>{
  const h=setup(t);let calls=0
  const controller=createActionController(async()=>{calls++})
  const dispose=installWheelGesture(controller,()=>source,()=>({wheelTrigger:'Alt'}))
  h.emit(h.document,'pointermove')
  assert.equal(h.emit(h.document,'keydown',{key:'Alt',target:new h.Element(true)}).defaultPrevented,false)
  assert.equal(controller.getSnapshot().wheel,null)
  h.emit(h.document,'keydown',{key:'Alt'});h.emit(h.document,'keydown',{key:'x'});h.emit(h.document,'keyup',{key:'Alt'})
  assert.equal(calls,0)
  h.emit(h.document,'keydown',{key:'Alt'});h.emit(h.document,'pointermove',{clientX:600});h.emit(h.document,'keyup',{key:'Alt'})
  await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1)
  dispose();await controller.dispose()
})
