import assert from 'node:assert/strict';
import { createFormActionDispatcher } from '../examples/form-action-dispatch.mjs';
let seen = [];
const host = { executeAction: async function(action) { assert.equal(this, host); seen.push(action); } };
const run = createFormActionDispatcher(host);
for (const ref of ['id', {id:'id'}, {name:'Unique name'}]) await run(ref);
assert.deepEqual(seen, ['id', {id:'id'}, {name:'Unique name'}]);
for (const ref of ['', ' ', null, {}, [], {id:''}, {id:'a',name:'b'}, {id:'a',payload:{}}]) {
  await assert.rejects(run(ref), /REFERENCE_INVALID/);
}
await assert.rejects(createFormActionDispatcher({})('id'), /API_UNAVAILABLE/);
await assert.rejects(run('id', true), /PREPARE_INVALID/);
let release;
const gate = new Promise(resolve => { release=resolve; });
const order=[];
const serial=createFormActionDispatcher({executeAction:async () => order.push('action')});
const first=serial('id',async () => { order.push('write'); await gate; order.push('visible'); });
await assert.rejects(serial('id',async () => order.push('overwrite')), /BUSY/);
assert.deepEqual(order,['write']); release(); await first;
assert.deepEqual(order,['write','visible','action']);
let called=0;
const failPrepare=createFormActionDispatcher({executeAction:async () => called++});
await assert.rejects(failPrepare('id',async () => {throw new Error('write failed');}), /write failed/);
assert.equal(called,0);await failPrepare('id');assert.equal(called,1);
let attempts=0;
const failAction=createFormActionDispatcher({executeAction:async () => {if (++attempts===1) throw new Error('host denied');}});
await assert.rejects(failAction('id'), /host denied/);await failAction('id');assert.equal(attempts,2);
console.log('FORM_ACTION_DISPATCH_TESTS_PASSED: references, host binding, API absence, ordering, shared lock, failure recovery. Mock host only.');
