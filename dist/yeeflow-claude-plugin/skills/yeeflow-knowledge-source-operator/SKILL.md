---
name: yeeflow-knowledge-source-operator
description: Create, inspect, update, validate, and safely retire application-bound Yeeflow Knowledge sources. Use when an AI Agent or Copilot needs a Document Library, Data List, or approved application source; when configuring fields and filters; or when proving an Agent/Copilot knowledge binding before publishing.
---

## Claude host requirements

If the Skill tool reports a virtual or missing base directory, do not assume bundled files are missing. When filesystem tools are available, locate .claude-plugin/plugin.json under the host-provided plugin mounts, verify its name is yeeflow and version matches this session, and resolve resources from that actual root. Do not use another installed version or another host cache. If multiple roots match, stop and report ambiguity.

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CLAUDE_PLUGIN_ROOT when provided. Read bundled resources with Claude's available file tools. Resolve shared docs, scripts and core from the plugin root, never from a developer checkout or another host's cache.

Use only the discovered tools of this plugin's unified yeeflow_mcp connection. Authenticate through Claude's connector/MCP OAuth flow. Never copy OpenAI login tokens or invent tool namespace prefixes. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the host's available Node runtime. File execution is available only where Claude supplies a filesystem and execution tools. In chat, report missing execution access and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Do not edit installed plugin caches or another host's skills. Put learning changes in an explicitly selected development checkout and rebuild this Claude package there. Maintainer references describing Codex/OpenAI publishing are for those platforms; Claude publishing uses docs/claude-plugin.md and scripts/build-claude-plugin.mjs in the source repository.



# Yeeflow Knowledge Source Operator

## Scope

Knowledge sources are application resources of component type `Knowledge`. The current MCP contract exposes their lifecycle through generic component operations: discover the contract first, then use `appbuilder_component_list`, `appbuilder_component_get`, `appbuilder_component_save`, and `appbuilder_component_delete` with `componentType: "Knowledge"`. Do not invent dedicated `knowledge_create`, `knowledge_update`, or `knowledge_delete` tool names.

Use this skill for a real application-bound source. A reusable Agent or Copilot template may describe a source as deferred, but must not claim it is connected until the target application has been configured and read back.

## Safe Lifecycle

1. Map the intended business purpose, source resource, permitted fields, filters, and every Agent/Copilot that may use it.
2. Read the application component contract and existing `Knowledge`, `AIAgent`, and `Copilot` resources. Reuse only the exact resource IDs returned by Yeeflow.
3. Create or update the Knowledge resource with a stable name and description. Each `Datas[]` entry must identify its source and type, and contain only approved fields and filters.
4. Read the saved Knowledge resource back. Confirm its ID, enabled state, each `Datas[]` source/type, and the configured field/filter scope.
5. Bind each consuming Agent or Copilot explicitly. Its `Components[]` entry must use `Type: 1`, the exact Knowledge `Source` ID, and the matching Knowledge name. A name alone is not a binding.
6. Save and read back every consuming Agent/Copilot. Its prompt or instructions may describe only the Knowledge sources that are actually bound.
7. Run the package-level binding check before generated-final packaging or publish:

```bash
node scripts/validate-knowledge-source-bindings.mjs <app.yap-or-decoded-data.json> --mode final
```

8. For deletion, first prove there are no reverse `Components[].Type === 1` references:

```bash
node scripts/validate-knowledge-source-bindings.mjs <app.yap-or-decoded-data.json> --mode final --delete-target <knowledge-id>
```

Do not delete a source with reported consumers. Do not delete a live source merely because its display name is similar to the requested target.

## Configuration and Verification Gates

- A Knowledge source needs a non-empty ID, name, and at least one `Datas[]` entry.
- Every data entry needs a source and type. Treat missing/invalid settings, fields, or filters as a configuration gap and re-read the source resource before publishing.
- An Agent/Copilot Knowledge component must resolve by `Source` to an included Knowledge ID. The component name must match that resource.
- If a prompt/instruction names a Knowledge source or source dataset but the resource is not bound, the final validator fails. Remove the claim or add and re-read the real binding.
- The validator proves package/configuration consistency only. UI visibility and retrieval quality require separate browser/runtime verification using safe test data.

## Authoring Guidance

- Keep the source narrowly scoped: approved fields, necessary filters, and a purpose-specific description.
- In Agent prompts and Copilot instructions, state what the configured source may be used for, what it cannot decide, and when to request human review.
- Never place credentials, bearer tokens, URLs with secrets, or private document contents in Knowledge settings, prompts, package fixtures, or logs.
- Preserve a clean distinction between: saved/read-back configuration, UI materialization, and live retrieval execution. Do not claim runtime retrieval from save success alone.

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
