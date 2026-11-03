import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveStageDisplay, buildOcrCacheKey, planAttachmentOcr, mayApplyOcrResult,
  documentRequirements, planArchiveChange, validateNativeFileMappings,
} from './lib/document-workflow-patterns.mjs';

const phases = [{ id: 'prepare' }, { id: 'onsite', requiresCompleted: ['prepare'] }];
const tasks = [
  { id: 'review', phase: 'prepare', state: 'approved' },
  { id: 'prepare-confirm', phase: 'prepare', state: 'pending' },
  { id: 'onsite-confirm', phase: 'onsite', state: 'not-started' },
];
test('later phase stays hidden while prerequisite approval is pending', () => {
  const r = resolveStageDisplay({ state: 'running', tasks, phases });
  assert.deepEqual(r.currentTasks, ['prepare-confirm']); assert.deepEqual(r.visiblePhases, ['prepare']);
});
test('actual preparation completion enables onsite phase', () => {
  const t = structuredClone(tasks); t[1].state = 'approved'; t[2].state = 'pending';
  const r = resolveStageDisplay({ state: 'running', tasks: t, phases });
  assert.deepEqual(r.visiblePhases, ['prepare', 'onsite']); assert.deepEqual(r.currentTasks, ['onsite-confirm']);
});
test('return to preparation does not highlight the highest historically reached phase', () => {
  const t = structuredClone(tasks); t[1].state = 'pending'; t[2].state = 'completed';
  const r = resolveStageDisplay({ state: 'running', tasks: t, phases });
  assert.deepEqual(r.currentTasks, ['prepare-confirm']); assert.deepEqual(r.visiblePhases, ['prepare']);
});
test('parallel active tasks remain a set', () => {
  const t = structuredClone(tasks); t[0].state = 'pending';
  assert.deepEqual(resolveStageDisplay({ state: 'running', tasks: t, phases }).currentTasks, ['review', 'prepare-confirm']);
});
test('rejected and withdrawn do not imply successful completion', () => {
  for (const state of ['rejected', 'withdrawn']) {
    const r = resolveStageDisplay({ state, tasks, phases });
    assert.deepEqual(r.currentTasks, []); assert.deepEqual(r.completedPhases, []);
  }
});
test('dependency conflict is visible and later task fails closed', () => {
  const t = structuredClone(tasks); t[2].state = 'pending';
  const r = resolveStageDisplay({ state: 'running', tasks: t, phases });
  assert.equal(r.dependencyConflict, true); assert.deepEqual(r.currentTasks, ['prepare-confirm']);
});
test('task-page fallback cannot override a known active task', () => {
  assert.deepEqual(resolveStageDisplay({ state: 'running', tasks, phases, fallbackTaskId: 'review' }).currentTasks, ['prepare-confirm']);
});
test('completed instance exposes completed phases', () => {
  assert.deepEqual(resolveStageDisplay({ state: 'completed', tasks, phases }).completedPhases, ['prepare', 'onsite']);
});
test('invalid phase dependencies and duplicate task identities are rejected', () => {
  assert.throws(() => resolveStageDisplay({ state: 'running', tasks, phases: [{ id: 'prepare', requiresCompleted: ['onsite'] }, phases[1]] }));
  assert.throws(() => resolveStageDisplay({ state: 'running', tasks: [...tasks, tasks[0]], phases }));
});

const ocr = {
  ocrApplicable: true, uploadState: 'complete', fileRef: 'upload-A', attachmentCount: 1,
  namespace: 'authorized-scope', documentType: 'permit', md5: '0123456789abcdef0123456789abcdef',
  md5Source: 'content-bytes', endpointConfigured: true, integrationAuthorized: true,
};
test('non-OCR rows do not enter hashing or require cache identifiers', () => {
  assert.equal(planAttachmentOcr({ ocrApplicable: false }).action, 'skip-non-ocr');
});
test('progress events cannot initiate hashing or cache reuse', () => {
  assert.equal(planAttachmentOcr({ ...ocr, uploadState: 'uploading' }).action, 'wait-for-upload');
});
test('completed upload needs a real file before any hash decision', () => {
  assert.equal(planAttachmentOcr({ ...ocr, fileRef: '' }).action, 'wait-for-upload');
  assert.equal(planAttachmentOcr({ ...ocr, md5: null }).action, 'hash-completed-file-bytes');
});
test('more than one attachment is outside this orchestrator contract', () => {
  assert.throws(() => planAttachmentOcr({ ...ocr, attachmentCount: 2 }));
});
test('random IDs and metadata-derived MD5 are not content identities', () => {
  assert.throws(() => planAttachmentOcr({ ...ocr, md5: 'random-upload-id' }));
  assert.throws(() => planAttachmentOcr({ ...ocr, md5Source: 'attachment-metadata' }));
});
test('same bytes and type share a key across uploads and MD5 letter cases', () => {
  assert.equal(buildOcrCacheKey(ocr), buildOcrCacheKey({ ...ocr, md5: ocr.md5.toUpperCase(), fileRef: 'upload-B' }));
});
test('different types, namespaces or content cannot collide', () => {
  for (const change of [{ documentType: 'license' }, { namespace: 'other-scope' }, { md5: '1123456789abcdef0123456789abcdef' }]) {
    assert.notEqual(buildOcrCacheKey(ocr), buildOcrCacheKey({ ...ocr, ...change }));
  }
});
test('cache identity tuple avoids ambiguous delimiters', () => {
  assert.notEqual(buildOcrCacheKey({ ...ocr, namespace: 'a:b', documentType: 'c' }), buildOcrCacheKey({ ...ocr, namespace: 'a', documentType: 'b:c' }));
});
test('only authorized successful matching cache data is reused', () => {
  const cache = { status: 'success', authorized: true, key: buildOcrCacheKey(ocr), result: { name: 'Synthetic' } };
  assert.equal(planAttachmentOcr({ ...ocr, cache }).action, 'reuse-success');
  for (const change of [{ status: 'failed' }, { authorized: false }, { key: 'different' }]) {
    assert.equal(planAttachmentOcr({ ...ocr, cache: { ...cache, ...change } }).action, 'request-recognition');
  }
});
test('manual force bypasses cache but never duplicates an in-flight request', () => {
  const cache = { status: 'success', authorized: true, key: buildOcrCacheKey(ocr) };
  assert.equal(planAttachmentOcr({ ...ocr, cache, forceRecognition: true }).action, 'request-recognition');
  assert.equal(planAttachmentOcr({ ...ocr, cache, forceRecognition: true, inFlight: true }).action, 'wait-for-request');
});
test('unconfigured or unauthorized integration cannot be represented as a request', () => {
  assert.equal(planAttachmentOcr({ ...ocr, endpointConfigured: false }).action, 'integration-unavailable');
  assert.equal(planAttachmentOcr({ ...ocr, integrationAuthorized: false }).action, 'integration-unavailable');
});
const current = { ...ocr, requestId: 'request-1', rowId: 'row-1', revision: 4 };
const response = { ...current, status: 'success' };
test('matching success may populate its unchanged row', () => assert.equal(mayApplyOcrResult(current, response), true));
test('late response cannot overwrite a changed, deleted or unrelated row', () => {
  for (const change of [{ revision: 5 }, { rowId: 'row-2' }, { requestId: 'request-2' }, { deleted: true }, { documentType: 'other' }]) {
    assert.equal(mayApplyOcrResult({ ...current, ...change }, response), false);
  }
});
test('failed results and unapproved overwrite of user edits are refused', () => {
  assert.equal(mayApplyOcrResult(current, { ...response, status: 'failed' }), false);
  assert.equal(mayApplyOcrResult({ ...current, userEdited: true }, response), false);
  assert.equal(mayApplyOcrResult({ ...current, userEdited: true, allowOverwriteEdits: true }, response), true);
});
test('decision and correlation helpers leave attachments and notes unchanged', () => {
  const input = { ...ocr, notes: 'Keep this note' }; const before = structuredClone(input);
  planAttachmentOcr(input); mayApplyOcrResult(current, response); assert.deepEqual(input, before);
});

const semantics = { 'N/A': 'not-applicable', '√': 'provided', '\u7f3a': 'missing' };
test('status change replaces obsolete validation errors without deleting data', () => {
  const input = { semantics, attachmentCount: 1, notes: '' }; const before = structuredClone(input);
  assert.deepEqual(documentRequirements({ ...input, status: '\u7f3a' }).errors, ['reason-required']);
  assert.deepEqual(documentRequirements({ ...input, status: 'N/A' }).errors, []);
  assert.deepEqual(input, before);
});
test('provided needs attachment, missing needs notes, unknown status is not silently valid', () => {
  assert.deepEqual(documentRequirements({ semantics, status: '√', attachmentCount: 0 }).errors, ['attachment-required']);
  assert.deepEqual(documentRequirements({ semantics, status: '\u7f3a', notes: 'Pending original' }).errors, []);
  assert.throws(() => documentRequirements({ semantics, status: 'unknown' }));
});
const archive = { versionPolicy: 'immutable-documents', recordId: 'archive-A', operation: 'edit-metadata' };
test('metadata correction preserves record and attachment identity', () => {
  assert.deepEqual(planArchiveChange(archive), { action: 'update-metadata', recordId: 'archive-A', preserveOriginal: true });
});
test('reupload cannot be disguised as metadata edit', () => {
  assert.throws(() => planArchiveChange({ ...archive, uploadPerformed: true }));
});
test('renewal and replacement create linked records even with the same content MD5', () => {
  for (const operation of ['renew', 'replace-attachment']) {
    const r = planArchiveChange({ ...archive, operation, uploadPerformed: true, newAttachmentRef: 'upload-B', oldMd5: ocr.md5, newMd5: ocr.md5 });
    assert.equal(r.action, 'create-linked-version'); assert.equal(r.predecessorId, 'archive-A'); assert.equal(r.promoteCurrent, false);
  }
});
test('promotion requires approval; renewal requires new upload', () => {
  assert.throws(() => planArchiveChange({ ...archive, operation: 'renew' }));
  assert.equal(planArchiveChange({ ...archive, operation: 'renew', uploadPerformed: true, newAttachmentRef: 'upload-B', approvalState: 'approved' }).promoteCurrent, true);
});
test('version policy is explicit and unknown operations cannot mutate records', () => {
  assert.throws(() => planArchiveChange({ ...archive, versionPolicy: null }));
  assert.throws(() => planArchiveChange({ ...archive, operation: 'delete' }));
});
test('file destinations reject serialized text while intentional JSON-text storage remains possible', () => {
  assert.deepEqual(validateNativeFileMappings([{ field: 'original', sourceType: 'file', destinationType: 'file-upload', transform: 'native' }]), []);
  assert.equal(validateNativeFileMappings([{ field: 'original', sourceType: 'file', destinationType: 'file-upload', transform: 'JSONStringfy' }])[0].code, 'NATIVE_FILE_MAPPING_REQUIRED');
  assert.deepEqual(validateNativeFileMappings([{ field: 'snapshot', sourceType: 'file', destinationType: 'text', transform: 'JSONStringfy' }]), []);
});
