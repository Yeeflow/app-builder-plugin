// Pure planning helpers. No product API, hashing, authorization, network or persistence.
const done = new Set(['approved', 'completed', 'skipped']);
const taskStates = new Set(['not-started', 'pending', 'approved', 'completed', 'skipped', 'rejected']);
const present = value => typeof value === 'string' && value.trim().length > 0;
const fail = message => { throw new TypeError(message); };

export function resolveStageDisplay({ state, tasks, phases, fallbackTaskId = null }) {
  if (!['draft', 'running', 'completed', 'rejected', 'withdrawn'].includes(state)) fail('Unknown workflow state');
  if (!Array.isArray(phases) || !phases.length || !Array.isArray(tasks)) fail('Phases and tasks are required');
  const phaseIds = new Set(phases.map(p => p.id));
  if (phaseIds.size !== phases.length || phases.some(p => !present(p.id))) fail('Phase IDs must be unique');
  const ids = new Set();
  for (const task of tasks) {
    if (!present(task.id) || ids.has(task.id) || !phaseIds.has(task.phase) || !taskStates.has(task.state)) fail('Invalid task mapping');
    ids.add(task.id);
  }
  for (let i = 0; i < phases.length; i++) {
    for (const required of phases[i].requiresCompleted ?? []) {
      if (!phases.slice(0, i).some(p => p.id === required)) fail('Phase dependency must refer to an earlier phase');
    }
  }
  const completedPhases = new Set(phases.filter(p => {
    const group = tasks.filter(t => t.phase === p.id);
    return group.length > 0 && group.every(t => done.has(t.state));
  }).map(p => p.id));
  if (state === 'completed') phases.forEach(p => completedPhases.add(p.id));
  const visiblePhases = phases.filter(p => (p.requiresCompleted ?? []).every(id => completedPhases.has(id))).map(p => p.id);
  const pending = state === 'running' ? tasks.filter(t => t.state === 'pending') : [];
  const currentTasks = pending.filter(t => visiblePhases.includes(t.phase)).map(t => t.id);
  if (!currentTasks.length && state === 'running' && fallbackTaskId) {
    const fallback = tasks.find(t => t.id === fallbackTaskId);
    // A task-page fallback is used only for context still not loaded, not for a known finished task.
    if (!pending.length && fallback?.state === 'not-started' && visiblePhases.includes(fallback.phase)) currentTasks.push(fallback.id);
  }
  return {
    state, currentTasks, visiblePhases, completedPhases: [...completedPhases],
    dependencyConflict: pending.some(t => !visiblePhases.includes(t.phase)),
  };
}

export function buildOcrCacheKey({ namespace, md5, documentType }) {
  if (!present(namespace) || !present(documentType) || typeof md5 !== 'string' || !/^[a-f\d]{32}$/i.test(md5)) fail('Cache identity requires namespace, content MD5 and document type');
  // JSON tuple avoids delimiter collisions and preserves configured document-type identity.
  return JSON.stringify([namespace, md5.toLowerCase(), documentType]);
}

export function planAttachmentOcr(input) {
  const result = action => ({ action });
  if (input.ocrApplicable !== true) return result('skip-non-ocr');
  if (!['pending', 'uploading', 'complete', 'failed'].includes(input.uploadState)) fail('Unknown upload state');
  if (input.uploadState !== 'complete' || !present(input.fileRef)) return result('wait-for-upload');
  if (input.attachmentCount !== 1) fail('This orchestrator requires exactly one completed attachment');
  if (!present(input.documentType) || !present(input.namespace)) fail('Document type and access namespace are required');
  if (!input.md5) return result('hash-completed-file-bytes');
  if (input.md5Source !== 'content-bytes' && input.md5Source !== 'verified-upload-content-hash') fail('MD5 must represent file contents');
  const cacheKey = buildOcrCacheKey(input);
  if (input.inFlight === true) return { action: 'wait-for-request', cacheKey };
  const force = input.forceRecognition === true;
  if (!force && input.cache?.status === 'success' && input.cache.authorized === true && input.cache.key === cacheKey) {
    return { action: 'reuse-success', cacheKey, result: input.cache.result };
  }
  if (input.endpointConfigured !== true || input.integrationAuthorized !== true) {
    return { action: 'integration-unavailable', cacheKey, forceRecognition: force };
  }
  return { action: 'request-recognition', cacheKey, forceRecognition: force };
}

export function mayApplyOcrResult(current, response) {
  if (current.deleted === true || response.status !== 'success') return false;
  const keys = ['requestId', 'rowId', 'revision', 'documentType', 'namespace'];
  if (keys.some(k => current[k] == null || response[k] == null || current[k] !== response[k])) return false;
  try {
    if (buildOcrCacheKey(current) !== buildOcrCacheKey(response)) return false;
  } catch { return false; }
  return current.userEdited !== true || current.allowOverwriteEdits === true;
}

export function documentRequirements({ status, semantics, attachmentCount, notes }) {
  const rule = semantics?.[status];
  if (!['not-applicable', 'provided', 'missing'].includes(rule)) fail('Unmapped document status');
  const requireAttachment = rule === 'provided';
  const requireNotes = rule === 'missing';
  const errors = [];
  if (requireAttachment && !(Number.isInteger(attachmentCount) && attachmentCount > 0)) errors.push('attachment-required');
  if (requireNotes && !present(notes)) errors.push('reason-required');
  // Always return a fresh error list. The UI adapter must replace obsolete errors, not append them.
  return { requireAttachment, requireNotes, errors };
}

export function planArchiveChange(input) {
  if (input.versionPolicy !== 'immutable-documents') fail('Select the version policy explicitly');
  if (!present(input.recordId)) fail('Existing archive record is required');
  if (input.operation === 'edit-metadata') {
    if (input.attachmentChanged === true || input.uploadPerformed === true) fail('A reupload requires a new archive version');
    return { action: 'update-metadata', recordId: input.recordId, preserveOriginal: true };
  }
  if (!['renew', 'replace-attachment'].includes(input.operation)) fail('Unknown archive operation');
  if (input.uploadPerformed !== true || !present(input.newAttachmentRef)) fail('Renewal/replacement requires a completed new attachment');
  return {
    action: 'create-linked-version', predecessorId: input.recordId, preserveOriginal: true,
    promoteCurrent: input.approvalState === 'approved',
  };
}

export function validateNativeFileMappings(mappings) {
  if (!Array.isArray(mappings)) fail('Mappings must be an array');
  const nativeFiles = new Set(['file', 'file-upload', 'image', 'img', 'signature']);
  return mappings.flatMap((m, index) => {
    if (!nativeFiles.has(m.destinationType)) return [];
    if (!nativeFiles.has(m.sourceType) || m.transform !== 'native') {
      return [{ code: 'NATIVE_FILE_MAPPING_REQUIRED', index, field: m.field ?? null }];
    }
    return [];
  });
}
