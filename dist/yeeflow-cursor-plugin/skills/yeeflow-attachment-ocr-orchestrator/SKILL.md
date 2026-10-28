---
name: yeeflow-attachment-ocr-orchestrator
description: Build or troubleshoot single-attachment OCR orchestration in Yeeflow, including upload-completion guards, content-MD5 and document-type caching, row-safe reuse and manual re-recognition. Use for OCR-enabled document form rows and archive reuse.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing uses docs/cursor-plugin.md and scripts/build-cursor-plugin.mjs in the source repository.



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

<!-- plugin-resource-access -->
## Portable access to bundled resources

Resolve this plugin's root from the current host-provided skill location: a skill is under `<plugin-root>/skills/<skill-name>`. Never hardcode a developer checkout, a macOS home directory, a Linux cache path, or a particular plugin version.

Use the skill-resource reader for files within the selected skill subtree. Shared references such as `docs/reference/...`, root validators and `core/...` are relative to the plugin root, not the current working directory. When the resource reader cannot read outside the skill subtree, read the existing shared file through the host's filesystem tools at its resolved plugin-root path. A resource-interface error alone does not prove the bundled file is missing. If no filesystem reader is available, report that access limitation; do not invent reference contents.

Resolve scripts relative to the mounted plugin and run with the host's available Node runtime. The application-generator validator entrypoint delegates to the root validator so shared dependencies resolve from the same package, including when launched from a temporary directory. Do not install dependencies or call remote write tools merely to read a template. Keep skill reads, script validation, live MCP reads, and business runtime acceptance as separate evidence.

## Unified Yeeflow MCP connection

Use the single `yeeflow_mcp` connection definition at `https://api.yeeflow.com/v1/mcp` for all live Yeeflow work. App Builder, Operations, Admin and Service Portal are capability domains within this connection, not separate servers or logins. Each account can use an independently authorized host connection to this same definition. Discover the current host-exposed tool names and schemas; do not invent namespace prefixes or assume tool contracts stayed identical after migration.

A single OAuth connection does not grant additional permissions. Operations serves business users; application structure/settings and resource creation require the appropriate application-administrator rights. Organization administration and Service Portal capabilities retain their own permission and context checks. Editor/Visitor access is not application-administrator access. On authentication failure reconnect this unified endpoint through the host; on permission denial stop the denied action without falling back to a former endpoint or another identity. Keep existing confirmation, readback, pagination, RowVersion and data-minimization rules.

## Independent sign-in and multiple connected accounts

On ChatGPT/OpenAI hosts, each user installs the same plugin and authorizes their own Yeeflow account through the host's OAuth connection flow. The host stores and selects independent connections, including additional accounts connected from plugin settings. Do not ask users to create an MCP server, supply an App ID, paste credentials, or configure local tokens. Do not implement custom account selectors, local profiles, environment variables or shared credentials. When the host-exposed tool schema declares a connection-routing parameter such as `link_id`, use only an exact connection value from the host-provided account list for the requested identity. This parameter selects a host-managed OAuth grant; it is not a Yeeflow business argument or a credential. Never invent routing fields or connection values, or forward account selectors to the upstream MCP server. Other hosts must follow their own supported connector/account-management flow; do not assume they expose OpenAI multi-account settings.

Before any account-dependent read or write, use the connection that matches the user's requested account and organization. If several connected accounts could match and the intended identity is ambiguous, ask the user to select the account and organization before accessing their business data. Do not guess from an email address alone, assume the most recently used account, or silently use every connection. If the host does not expose the requested connection or cannot route to it, preserve the operation and ask the user to select or connect that account in plugin settings; do not invent an account selector argument.

When the host exposes an authenticated profile tool, discover its actual name and schema. The upstream designated profile tool declares `_meta["openai/profile"]: true`, accepts an empty object and returns the profile represented by the selected connection's credentials. The host may add a connection-routing field to its exposed wrapper; follow that actual schema while keeping the upstream profile call free of account selectors. Use its stable opaque `id` to distinguish profiles and its optional display fields for labels. Do not treat email, nickname or display name as a stable identity. A profile tool helps identification; it does not enable multi-account access or grant permissions. Do not invent a profile tool or bypass host routing when it is unavailable.

After switching connections or organizations, call `workspace_list` again and rediscover the target application/resources and permissions. Scope all reused IDs, RowVersion values, cached results and permission conclusions to the selected connection and organization; never carry them across identities. Bind write confirmation and readback to that same account, organization, target and action. If identity changes after confirmation, obtain confirmation for the new target before writing.

On authentication failure, reconnect only the affected connection. On permission denial, stop the denied operation; never retry it using another connected account. Read multiple accounts only when the user explicitly requests that scope, and label each result by its account and organization. Do not include credentials, access tokens or private profile IDs in user-facing results or generated artifacts.
