# Reuse and writeback reference

## Identity decisions remain project-specific

Create a mapping table with: physical-unit text/business key, tenant lookup ID, lease/contract references, document-type code, archive record ID, attachment identity/hash, version predecessor and source process. Never equate a display string, lookup ID and business key. A physical unit can have several tenants over time; one company can have multiple stores. Confirm document ownership and sharing before choosing a composite key.

If a project elects to accumulate handover snapshots by unit text, preserve that text and its namespace while retaining tenant/source history. Do not silently turn that decision into a universal tenant-archive primary key. Historical onboarding can be a separate migration/update path; absence of a newly introduced workflow record need not block an existing business when the requirement allows it.

## Update choices

| Intent | Operation under the immutable-document policy | Preserve |
| --- | --- | --- |
| Correct metadata, same original attachment | Update current archive row | Original attachment and provenance |
| Renew a certificate | Create a linked record with a newly uploaded attachment | Previous version and prior validity |
| Replace/reupload an attachment | Create a linked record, even for identical bytes | Historical record and original file |
| Apply a reused OCR result | Populate eligible consumer fields | Cache provenance and human corrections policy |

Do not automatically delete old records or mark a new upload approved. Promotion to current and expiry/version history must follow the target workflow.

## Native type failure learned from execution

A workflow archive action failed when a file-upload field was mapped from `JSONStringfy` applied to a file row field. Minimal direct-file mapping succeeded; restoring the full mapping while changing only that attachment projection succeeded, followed by a complete approval and multi-row archive writeback. This is evidence for file-type fidelity, not a guarantee that every file transformation or batch shape is supported.

When isolating failures, test direct scalar fields, then native attachment values, then optional expressions/aggregations. Inspect the saved destination field's real type. A field label that says “file” does not prove its storage type. Do not repeatedly publish speculative changes when an isolated test can narrow the issue.

## Access and performance

Determine the largest allowed default view only after permission/group evidence is ready; for a hierarchy such as Management → Team → own, fail closed while it is unknown. Team membership can aggregate the tenants whose AMs belong to that group when explicitly configured. This is a view predicate inside the account's existing source permissions, not row-level authorization by itself.

Display a permitted first page before optional full indexes/statistics where the product permits it. Keep filters disabled or clearly marked until their required indexes are complete, and discard stale results after selection changes. Do not infer complete counts from a one-row query or promise a speedup without comparable measurements.
