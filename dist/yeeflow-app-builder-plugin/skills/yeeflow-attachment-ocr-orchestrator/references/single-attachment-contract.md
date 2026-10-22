# Single-attachment recognition contract

## State and cache

Use explicit states for upload pending, hash pending, cache lookup, result ready, recognition in flight, failed, and integration unavailable. Loading a cache result must not retrigger the upload handler or produce a render loop. Prefer a verified upload-complete event; if the product only provides generic change events, define and test a completion guard against actual attachment data before enabling hashing.

The logical cache identity is `content MD5 + stable document type`. Use a tenant/access namespace around it; a content match is not permission to disclose a result. A scope change must not reuse an unauthorized cache entry. Identical bytes uploaded twice have the same MD5 even when their upload IDs differ. A different type requires a different interpretation and therefore a different cache entry.

Store hash, attachment identity, cache identity, OCR request identity and archive-record identity in separate fields. Preserve legacy identifiers as history if needed, but exclude random IDs and metadata-derived hashes from content-cache matching. Do not relabel an old random identifier as an MD5.

## Request and response agreement

Agree with the developer on these concrete contract elements before activating an integration:

- Single-file transport: bytes or a supported expiring download reference, original filename, media type, size, document-type code, content MD5, request ID, and force-recognition flag.
- Response mode: synchronous result or asynchronous acceptance plus callback/status query; authentication, environment separation, timeout, retry and error behavior.
- Correlation: echo request ID, document type and content MD5; retain enough local context to reject stale callbacks and prevent duplicate writes. A cache key is not the identity of a forced retry request.
- Typed results per document group, including date normalization, absent values, field confidence if supplied, and a separate raw result for diagnosis. Confirm field names against the consumer's existing controls.
- Failure: machine-readable code, useful message, retryable flag and terminal status. An unsuccessful response must not be indexed as a successful cache result.

Do not hardcode customer field names, document categories, URL endpoints, credentials or retention periods in the skill. Document those in the target project. MD5 is a content-cache identifier here, not an authentication or integrity-security guarantee.

## User edits and versions

Manual retry may explicitly replace recognized fields only according to the configured edit policy; always retain the attachment and notes. Reusing a machine result does not imply that a previous tenant's corrected business values are appropriate. Track result provenance and allow review.

Replacing or renewing an archived document follows the archive version policy even when a cache result can be reused. Cache deduplication does not authorize overwriting the historical archive row.

## Evidence retained from the source project

Content hashing, upload guards, cache/type isolation, and manual retry preserving attachment/notes were tested locally and in a scoped form runtime. The third-party endpoint and successful live callback round trip were not integrated. Maintain that distinction in future reports.
