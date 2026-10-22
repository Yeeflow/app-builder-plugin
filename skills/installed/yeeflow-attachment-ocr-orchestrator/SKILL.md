---
name: yeeflow-attachment-ocr-orchestrator
description: Build or troubleshoot single-attachment OCR orchestration in Yeeflow, including upload-completion guards, content-MD5 and document-type caching, row-safe reuse and manual re-recognition. Use for OCR-enabled document form rows and archive reuse.
---

# Single-Attachment OCR Orchestration

Read [single-attachment-contract.md](references/single-attachment-contract.md) when implementing the state machine, callback contract or third-party handoff. Discover live capabilities and existing OCR-task/cache lists before creating new resources. Use the available Custom Code or Custom Service specialist when that execution surface is actually required; do not assume a service endpoint exists.

## Per-row execution

1. Evaluate the row's configured OCR applicability first. A non-OCR row does not need an OCR cache identity or retry button. Preserve any unrelated native attachment identifier.
2. Wait for one fully uploaded, accessible attachment. A change event or an upload ID appearing is not sufficient completion proof. Do not fetch bytes, hash, query OCR cache or call OCR during progress events.
3. Calculate MD5 from the original file bytes, or consume a trusted content hash returned by the upload service after confirming its meaning. Never substitute `UniqueID`, the filename, an upload-record ID, URL, or a hash of attachment metadata. Normalize hexadecimal case.
4. Look up an authorized successful result by content MD5 and stable document-type code inside the appropriate tenant/data-access namespace. Reuse the result only when the row's attachment revision, type and context still match.
5. On a miss, use only the configured and authorized OCR integration. If no endpoint exists, retain an explicit integration-not-configured state; do not fabricate a successful recognition.
6. Show a manual recognize/retry action only for applicable rows. After upload completion, an explicit forced request bypasses the success cache. Serialize requests per row and do not create duplicates while one is in flight. Preserve the uploaded file and notes.

Bind responses using request identity plus the row's current file revision/hash/type. Ignore superseded results after replacement, row deletion or a type change. Do not update unrelated rows. Cached machine output and later human edits are distinct: reuse must not silently overwrite a user's corrections.

## Verification boundary

Run local hash vectors, identical-byte/different-upload-ID cases, different-type isolation, upload-progress suppression, double-click protection and stale-result tests. Then separately test the live target's upload completion, cache query, field mapping, failure and manual retry. A mock response proves local decisions only. A successful third-party request/callback/field writeback must be observed before claiming integration completion.

`scripts/lib/document-workflow-patterns.mjs` supplies a pure decision helper, not a hash implementation, network client or live integration. `scripts/test-document-workflow-patterns.mjs` exercises the reusable guards. Keep customer documents and real OCR results outside the distributable plugin.
