---
name: yeeflow-workflow-stage-ui
description: Configure native Yeeflow stage progress, phase visibility and task-specific Toggle defaults from actual workflow state. Use for staged approval or fulfillment forms, including editable demonstration copies.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing is documented in the source repository at https://github.com/Yeeflow/app-builder-plugin/blob/main/docs/cursor-plugin.md (not bundled in this package).



# Workflow Stage UI

Use the existing workflow as the source of truth for progress. Read its task-to-page assignments, routes and current form definitions before editing. A request to improve presentation does not authorize new approval routes, changed assignees, business writes or publication without the user's corresponding scope.

## Choose the binding

- Prefer the native Steps bar for a supported visual pattern. Read [native-task-progress.md](references/native-task-progress.md) for the observed task-context serialization and chevron configuration.
- Resolve the active task from native task context and instance state. Completion of an input field, presence of a signature or existence of an attachment does not prove a phase is approved.
- For a dedicated active task page, its actual task assignment can provide a display fallback while context loads. Do not let that fallback override a later active task on historical/read-only pages.
- In parallel or repeated-task workflows, retain the active task set. A highest-ever-reached task is not necessarily current after a return. Check runtime context semantics for the target workflow before choosing aggregation.
- Use the target's actual completion/rejection/withdrawal status mapping. Keep interrupted states distinct from successful completion.

## Compose the form

Map each phase to its entry/completion evidence, visible sections, editable fields and initial Toggle state. Show later-phase input only after its prerequisite is satisfied. Preserve earlier information as review context unless explicitly excluded. Explain whether the overview of future phases remains visible.

Native Toggle `active-default` initializes the whole Toggle. When different panels must open independently, use independent one-panel Toggles and retain their business controls and bindings. Set defaults on the actual task pages; allow the user to collapse or reopen them. Do not continuously force panels open after every field change.

Reuse the selected native form template and existing controls. Keep demo-only state and a fully editable showcase in a separate non-business surface with the requested access; do not add a user-editable stage switch to the operational form. Preserve an existing backup rather than rewriting it during style changes.

## Verify and report

Compare workflow graph, variables, mappings and permissions before/after when the requested change is UI-only. Separate persistence, native publication, preview, and actual task-transition evidence. Test the phase boundary, a historical/read-only view and the affected task defaults. For a return/parallel flow, test that path before claiming it works.

Check both a phone and a tablet viewport. Keep horizontal scrolling inside the Steps bar or wide detail region, not the whole page. Report measured widths and actual screenshots rather than claiming device proof from CSS alone. State the last task truly exercised; a file-confirmation Preview is not proof of document generation or final archiving.

The plugin's `scripts/lib/document-workflow-patterns.mjs` provides a pure planning helper and `scripts/test-document-workflow-patterns.mjs` tests its state decisions. It is not a Yeeflow payload compiler or runtime state reader.

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
