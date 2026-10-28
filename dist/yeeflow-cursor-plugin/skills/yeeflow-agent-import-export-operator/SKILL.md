---
name: yeeflow-agent-import-export-operator
description: Export, inspect, validate, and organize Yeeflow AI Agent .yaia template packages. Use when saving Agents as templates, checking exported packages, studying Yeeflow import/export payloads, or preparing safe import/export batches without guessing resource bindings.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing uses docs/cursor-plugin.md and scripts/build-cursor-plugin.mjs in the source repository.



# Yeeflow Agent Import Export Operator

## Export Workflow

1. Confirm the source Yeeflow category and Agent names.
2. Query or inspect live Agents and collect IDs.
3. Export each Agent one at a time using the authenticated Yeeflow session or known API route.
4. Save files under the requested folder. Preserve `.yaia` extension.
5. Validate:
   - expected file count
   - non-empty files
   - readable outer JSON wrapper
   - exact outer keys `Category`, `Description`, `IconUrl`, `Name`, `PackageJson`, `TemplateId`, and `Type`
   - `Type = 0`
   - no accidental duplicate or stale export

## Known Yeeflow Export Notes

- `.yaia` files are JSON wrappers with an opaque `PackageJson` payload.
- Prior evidence indicates `PackageJson` is Base64 around Brotli-compressed inner text, but wrapper details may vary.
- Do not generate import packages from guessed binary structure. Use normalized `importRead` / `import` paths only after validation.
- Tool definitions can contain real list, workflow, Agent, or HTTP bindings. Do not clone those blindly into reusable templates.

## Safety Rules

- Do not import until the user explicitly asks.
- Do not overwrite, delete, rename, or duplicate live Agents unless the user explicitly asks.
- Treat exported files as templates only after validating names and package shape.

## Useful Script

Run `scripts/validate_yaia_exports.js <folder> [expected-count]` to validate an export folder.

## Independent File Finalization

Do not synthesize `PackageJson`. Obtain a complete Agent wrapper and normalized `importRead` result from the official Yeeflow import/export path. Store them in one canonical evidence JSON with the exact keys `source`, `operation`, `endpointKind`, `responseId`, `envelope`, and `importRead`, then run:

```bash
node scripts/finalize-yaia-from-official-response.js \
  official-agent-response-evidence.json output.yaia \
  --receipt output.yaia.receipt.json \
  --issued-ids issued-ids.json

node scripts/validate-yaia.js output.yaia \
  --stage final \
  --provenance official-provenance.json \
  --import-read normalized-import-read.json \
  --issued-ids issued-ids.json
```

The finalizer calculates the integrity receipt automatically and is fixed to final mode. It must fail when response metadata or `importRead` evidence is missing, the envelope contains extra keys, or the generated hashes do not match. The receipt proves artifact/evidence consistency; it does not cryptographically authenticate that the caller actually used an official Yeeflow endpoint. Preserve the authenticated session/API response evidence separately. Structural mode may validate an existing wrapper without claiming it is generated-final or importable.

<!-- agent-copilot-application-resource-learning:start -->
## Application Resource Export Learning

The DEMO Innovation Ecosystem Platform .yap study proves that app-contained AI Agents live in Data.OtherModules where Type = "Agents" and individual AI Agent resources use Type = 0. The same module also contains Copilots with Type = 1. Treat app-contained Agent exports differently from standalone .yaia packages: tool bindings may reference app data lists, knowledge resources, other AI resources, and application connections.

When inspecting app-level exports, decode read-only, preserve large numeric IDs as strings, and redact tenant/user IDs, connection IDs, endpoints, OAuth/client metadata, token-like values, and credentials. Do not clone Components blindly into reusable templates. For generated packages, unresolved Settings.Data.Value references to lists, connections, current app/listset, or connected Agents are blockers in final mode.
<!-- agent-copilot-application-resource-learning:end -->

<!-- scheduled-workflow-ai-assistant-learning:start -->
## Workflow Invocation Learning

`AI Agent and Copilot Local Resource Baseline8.yap` proves app-contained AI Agents can be invoked from workflow `AI` nodes, not only from Copilots. The workflow stores the target Agent ID in `properties.data.AgentID` and maps inputs/outputs through `properties.inputVariables[]` and `properties.outputVariables[]`. When inspecting app-level exports, include workflow references to Agents in the dependency graph and do not execute live AI during validation.

`Spark & AI (1).yap` adds a data-list workflow invocation case: the host list registers the workflow in `FlowMappings[]`, the workflow `AI` node maps an `icon-upload` list field into Agent input `label_image`, and native `ListDataID` into a row-ID input for same-item update behavior. When inspecting similar exports, redact uploaded-image details and record payloads, and separately map any application-resource access tool that can update app data.
<!-- scheduled-workflow-ai-assistant-learning:end -->

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
