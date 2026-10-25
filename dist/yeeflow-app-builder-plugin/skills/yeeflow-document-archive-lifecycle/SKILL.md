---
name: yeeflow-document-archive-lifecycle
description: Design and repair Yeeflow document reuse, metadata updates, renewals and approval-time archive writeback across related applications. Use when attachments and recognized business fields must retain versions and traceable ownership.
---

# Document Archive Lifecycle

Establish the target's identity and ownership model before mapping files: tenant/company, physical unit, lease period, source application, document type, archive version and original attachment are different identities. Read [reuse-and-writeback.md](references/reuse-and-writeback.md) for the evidence-backed mapping and version practices.

## Plan reuse and updates

- Build an explicit source → consumer → approval/writeback mapping for each document group. Include attachment type, business fields, source record, timestamps and current/version status. Reuse existing list fields and actual Service/list variable IDs.
- Fetch the latest eligible record under the agreed identity, document type, access scope and validity/current policy. Define deterministic ordering and ties. “Latest created” alone is not always “latest approved”.
- Retain original attachments and recognized/business fields together when loading a form row. Ask the user whether to update according to the workflow; do not automatically replace an existing document merely because it is older.
- For the immutable-document policy used by this pattern, metadata-only edits update the existing record. Renew or attachment replacement creates a linked new version; the old attachment and record remain. A same-MD5 reupload can reuse OCR but still follows the new-version rule. Make this policy explicit rather than silently applying it to every unrelated project.
- Activate a new current version at the agreed approval milestone. Define idempotency and predecessor handling so retries cannot duplicate archives or deactivate the wrong version. Do not claim concurrency or retry safety without tests.

## Keep storage and UI proportional

Complex Service JSON may hold backend snapshots without exposing every technical detail as business lists. Use standalone document records where per-file updates, recognition, search, history or archive reuse require them. Choose from the actual product capabilities and user requirement; do not universally replace one with the other.

Organize details into business/document fields, recognized business information, source/version and a unified OCR diagnostics Grid. Hide empty optional groups as appropriate. Technical request IDs and raw OCR payloads are not business input fields. Keep View, Edit and renewal actions distinguishable.

## Validate the closed loop

Check file-typed mappings before serialization. A file-upload destination must receive a native compatible file value; wrapping an attachment in `JSONStringfy(...)` creates text and can fail archive execution. Preserve JSON serialization only where the destination is intentionally text/complex JSON.

Verify an actual approved record's attachment and field writeback, source links and reuse by the next application. With no backend execution logs, isolate the smallest reproducible mapping and vary one factor at a time. Keep failed diagnostics and passing evidence distinct. Work on disposable authorized records and restore temporary setup data.

`scripts/lib/document-workflow-patterns.mjs` includes file-mapping and version-operation planning checks; these do not execute writes. Use the native workflow/list generators for real payloads and retain their contracts.

<!-- plugin-resource-access -->
## Portable access to bundled resources

Resolve this plugin's root from the current host-provided skill location: a skill is under `<plugin-root>/skills/<skill-name>`. Never hardcode a developer checkout, a macOS home directory, a Linux cache path, or a particular plugin version.

Use the skill-resource reader for files within the selected skill subtree. Shared references such as `docs/reference/...`, root validators and `core/...` are relative to the plugin root, not the current working directory. When the resource reader cannot read outside the skill subtree, read the existing shared file through the host's filesystem tools at its resolved plugin-root path. A resource-interface error alone does not prove the bundled file is missing. If no filesystem reader is available, report that access limitation; do not invent reference contents.

Resolve scripts relative to the mounted plugin and run with the host's available Node runtime. The application-generator validator entrypoint delegates to the root validator so shared dependencies resolve from the same package, including when launched from a temporary directory. Do not install dependencies or call remote write tools merely to read a template. Keep skill reads, script validation, live MCP reads, and business runtime acceptance as separate evidence.

## Unified Yeeflow MCP connection

Use the single `yeeflow_mcp` connection definition at `https://api.yeeflow.com/v1/mcp` for all live Yeeflow work. App Builder, Operations, Admin and Service Portal are capability domains within this connection, not separate servers or logins. Each account can use an independently authorized host connection to this same definition. Discover the current host-exposed tool names and schemas; do not invent namespace prefixes or assume tool contracts stayed identical after migration.

A single OAuth connection does not grant additional permissions. Operations serves business users; application structure/settings and resource creation require the appropriate application-administrator rights. Organization administration and Service Portal capabilities retain their own permission and context checks. Editor/Visitor access is not application-administrator access. On authentication failure reconnect this unified endpoint through the host; on permission denial stop the denied action without falling back to a former endpoint or another identity. Keep existing confirmation, readback, pagination, RowVersion and data-minimization rules.

## Independent sign-in and multiple connected accounts

On ChatGPT/OpenAI hosts, each user installs the same plugin and authorizes their own Yeeflow account through the host's OAuth connection flow. The host stores and selects independent connections, including additional accounts connected from plugin settings. Do not ask users to create an MCP server, supply an App ID, paste credentials, or configure local tokens. Do not implement account switching through tool arguments, local profiles, environment variables or shared credentials. Other hosts must follow their own supported connector/account-management flow; do not assume they expose OpenAI multi-account settings.

Before any account-dependent read or write, use the connection that matches the user's requested account and organization. If several connected accounts could match and the intended identity is ambiguous, ask the user to select the account and organization before accessing their business data. Do not guess from an email address alone, assume the most recently used account, or silently use every connection. If the host does not expose the requested connection or cannot route to it, preserve the operation and ask the user to select or connect that account in plugin settings; do not invent an account selector argument.

When the host exposes an authenticated profile tool, discover its actual name and schema. A designated profile tool declares `_meta["openai/profile"]: true`, accepts an empty object and returns the profile represented by the selected connection's credentials. Use its stable opaque `id` to distinguish profiles and its optional display fields for labels. Do not treat email, nickname or display name as a stable identity. A profile tool helps identification; it does not enable multi-account access or grant permissions. Do not invent a profile tool or bypass host routing when it is unavailable.

After switching connections or organizations, call `workspace_list` again and rediscover the target application/resources and permissions. Scope all reused IDs, RowVersion values, cached results and permission conclusions to the selected connection and organization; never carry them across identities. Bind write confirmation and readback to that same account, organization, target and action. If identity changes after confirmation, obtain confirmation for the new target before writing.

On authentication failure, reconnect only the affected connection. On permission denial, stop the denied operation; never retry it using another connected account. Read multiple accounts only when the user explicitly requests that scope, and label each result by its account and organization. Do not include credentials, access tokens or private profile IDs in user-facing results or generated artifacts.
