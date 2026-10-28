---
name: yeeflow-ai-agent-ui-operator
description: Safely operate the Yeeflow AI Agent management UI to create, inspect, edit, verify, publish, export, or pause on unclear Agent configuration. Use when working in an authenticated Yeeflow browser session, especially for AI Agent fields, variables, Persona & Prompt, icons, tools, and publish status.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing is documented in the source repository at https://github.com/Yeeflow/app-builder-plugin/blob/main/docs/cursor-plugin.md (not bundled in this package).



# Yeeflow AI Agent UI Operator

## Operating Principles

- Use the existing authenticated Chrome tab when the user says Chrome is already open.
- Do not open a new browser window unless the current page is unrecoverable.
- Start from the AI Agent management page whenever creating or checking Agents.
- Check for exact-name duplicates before creating.
- Save and verify one Agent before moving to the next when using manual UI entry.

## Field Workflow

1. Upload the matching 64x64 icon.
2. Enter exact name and short description.
3. Enter Persona & Prompt, preserving multiline formatting where the UI allows.
4. Add variables carefully:
   - one row at a time
   - fill name, type, and description before adding another row
   - remove or correct placeholder rows before saving
5. Do not add tools unless the user provides real resource/API bindings.
6. Save, verify fields, publish, then return to management page.

## Tool Setup Rule

For reusable AI Agent templates, defer tools by default. The Yeeflow Tools UI exposes operational tool types that require real bindings such as lists, approval forms, workflows, target Agents, or HTTP connections. Do not map simple document tool guidance into those controls by guessing.

## Stop Conditions

Pause and report if:

- the page is not clearly the AI Agent management or Agent detail page
- an exact-name Agent already exists but is incomplete
- a variable placeholder row cannot be removed
- variable count, type, or description cannot be verified
- Persona & Prompt disappears after save
- publish fails
- navigation behavior changes or is unclear

<!-- agent-copilot-application-resource-learning:start -->
## App Resource UI Safety

When inspecting app-bound Agents in Yeeflow UI, expect tools that point to app lists, knowledge resources, connected Agents/Copilots, or application connections. Do not execute external Outlook, SharePoint, OAuth, or HTTP tools during verification unless safe test credentials and call scope are explicitly approved.

For runtime checks, prefer non-executing confirmation first: Agent appears, configuration page opens, components/tool names render, linked list/knowledge/connection references are visible, and no live external call is triggered.

For each visible Knowledge component, verify it is the intended source rather than a same-name substitute: open the source where possible, compare the saved Knowledge name and ID, and confirm the Agent prompt names no additional unbound Knowledge source. Save/read-back is required before publish; a safe retrieval test is a separate, explicit runtime step.
<!-- agent-copilot-application-resource-learning:end -->

<!-- scheduled-workflow-ai-assistant-learning:start -->
## Workflow Invocation UI Safety

When checking an Agent that is referenced by a workflow AI Assistant action, verify the Agent input/output variables match the workflow action mappings before publishing or runtime testing. Do not run the scheduled workflow or AI action from the UI unless the schedule, data, and downstream email behavior are explicitly safe.

For data-list workflow cases such as `Spark & AI (1).yap`, also verify whether the workflow maps a current-row upload field into an Agent `img` input and whether the Agent has an application-resource access tool scoped to local data lists. Do not trigger the workflow from UI when the host list contains real rows or the tool can update live business data.
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
