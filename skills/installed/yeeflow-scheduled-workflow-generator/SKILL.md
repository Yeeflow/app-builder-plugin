---
name: yeeflow-scheduled-workflow-generator
description: Generate, validate, inspect, and debug standalone Yeeflow Scheduled Workflow .ywf files. Use when a user requests an independently importable scheduled workflow, recurrence configuration, WorkflowType 3 graph packaging, scheduled workflow round-trip validation, or safe scheduled workflow fixtures without generating a full application package.
---

# Yeeflow Scheduled Workflow Generator

## Core Contract

Generate standalone Scheduled Workflow files with the same workflow graph builders, action configuration rules, dependency mapping, and Workflow Designer gates used by full application generation. Do not hand-build a simplified graph that diverges from the full-app path.

Use the export-proven profile:

- outer file extension `.ywf`;
- outer `WorkflowType = 3`;
- decoded `Def.workflowType = 3`;
- `FlowKey` equals decoded `Def.defkey`;
- `Settings` is a JSON string containing recurrence settings;
- workflow resource registration uses `ListID = 0` when materialized inside an app.

Read [standalone-scheduled-ywf-profile.md](references/standalone-scheduled-ywf-profile.md) when designing or validating the wrapper.

## Generation Workflow

1. Produce a reviewed Scheduled Workflow plan, including recurrence, timezone, actions, variables, dependencies, recipient safety, deployment state, and proof boundary.
2. Allocate or obtain issued IDs. Never copy IDs from an unrelated export.
3. Prepare a canonical shared-builder plan containing the exact Scheduled Workflow metadata, issued `rootListSetId` and `defResourceId`, selected resource inventory, `actionRecords`, and `loopRecords`.
4. Generate the decoded `Def` with the exported full-app workflow builder and wrap it in one command:

```bash
node scripts/generate-scheduled-ywf-from-plan.mjs \
  scheduled-workflow-plan.json \
  output.ywf \
  --issued-ids issued-ids.json
```

5. Use the lower-level `build-scheduled-ywf-wrapper.js` only when a decoded `Def` has already been produced by a proven shared builder; do not hand-author the graph.
6. The generator must run pre-write validation, write a temporary file, reread it, compare bytes, run post-write validation, and rename only after success.
7. Validate independently:

```bash
node scripts/validate-scheduled-ywf.js output.ywf --stage final --issued-ids issued-ids.json
```

## Hard Gates

- Require the exact export-proven outer keys and canonical UTF-8 JSON.
- Require parseable canonical base64 `Def` and parseable `Settings`.
- Require one Start event, at least one End event, unique node IDs, and resolvable SequenceFlow endpoints.
- Require `AppListSetID`, `ProcModelAppID`, and the export-proven process metadata keys.
- Require issued-ID provenance in final mode.
- Block unresolved placeholders and unacknowledged fixed email recipients.
- Validate referenced Data Lists, fields, AI Agents, Custom Services, and connections before final handoff.
- Default generated runtime baselines to a safe future schedule and non-deployed state. Do not execute a schedule, AI action, email, service, or record mutation without explicit authorization.
- The current shared generation facade supports the export-proven Set Data List and Loop action family. For AI, email, Query Data, Invoke Service, or other action families, require a separate export-proven shared builder before claiming requirement-to-file generation.

## Proof Boundary

Local wrapper generation and validation prove only canonical structure, graph consistency, recurrence shape, ID provenance, and round-trip stability. They do not prove tenant import, Designer rendering, schedule activation, action execution, email delivery, AI execution, or Custom Service runtime behavior.

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
