---
name: yeeflow-feature-configuration-guide
description: Explain, choose, configure, and troubleshoot individual Yeeflow features — controls, fields, form and page actions, data lists, filters, workflow steps, reports, dashboards, and portals — grounded in official Yeeflow Help Center references loaded on demand. Use for "which control/action should I use", "how do I configure X", or "why does X behave like this" questions and focused configuration changes. For whole-application builds, packages, or generated resources, use the application builder and generator skills instead.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing is documented in the source repository at https://github.com/Yeeflow/app-builder-plugin/blob/main/docs/cursor-plugin.md (not bundled in this package).



# Yeeflow Feature Configuration Guide

Solve the current task with suitable Yeeflow capabilities while preserving the user's design, existing configuration, and authorized scope. Do not import business rules or example identifiers from another project.

## Load only what is needed

Search by control name, feature ID, or task keywords, then read the matching entries. Translate incoming task terms into canonical English names when useful for retrieval. Do not read the entire catalog or every reference. Load dependencies only when they affect the current conclusion.

Run the bundled read-only helper with the host's Node runtime, resolving `<skill-dir>` to this skill's directory (`<plugin-root>/skills/yeeflow-feature-configuration-guide`):

```text
node "<skill-dir>/scripts/knowledge.mjs" search "Lookup" --limit 6
node "<skill-dir>/scripts/knowledge.mjs" search "query no match" --domain actions
node "<skill-dir>/scripts/knowledge.mjs" read G09-034 G09-142
```

Search returns metadata and summaries (with `has_considerations` when an entry carries configuration notes), not full articles. `read` loads only the selected entries. Distinguish similarly named page steps and background actions with `--domain actions` or `--domain workflows`. Domains: `designers`, `fields`, `layout`, `data-display`, `filters`, `rules`, `actions`, `workflows`, `lists`, `reports`, `portal`, `applications`.

If Node execution is unavailable, read `references/feature-catalog.json` with file tools and use only the entries whose `id`, `name`, or `aliases` match. No match means try a synonym or the official Help Center search; it does not prove that a capability is absent.

## Route the task

| Task | Load when relevant |
| --- | --- |
| Distinguish objects, fields, values, and execution contexts | [Concepts](references/concepts.md) |
| Choose controls and configure bindings or validation | Search `fields`, `designers`, or `layout`; use [tasks](references/tasks.md) T01 to T03 for a composite task |
| Query, filter, present, or aggregate data | Search `data-display`, `filters`, or `reports`; use T04 or T07 |
| Configure page events, buttons, and action steps | Search `actions`; use T05 or T08 for persistence or execution placement |
| Configure tasks, forms, assignees, branches, or workflow actions | Search `workflows`; use T06 for coordination |
| Configure list records, documents, access, or triggers | Search `lists` plus the specific action involved |
| Configure application resources, AI, or portals | Search `applications` or `portal` |
| Change several resources, coordinate dependencies, or verify runtime behavior | [Application implementation](references/application-implementation.md); load only the relevant section |
| Check applicability, freshness, or official learning routes | [Sources](references/sources.md), then the relevant official article |

Hand off to the specialist skills in this plugin when the work goes beyond a focused feature change:

| Work | Skill |
| --- | --- |
| Plan and build a whole application from requirements | `yeeflow-application-builder` |
| Add or change live resources step by step through MCP | `yeeflow-mcp-incremental-application-builder` |
| Generate data lists, approval forms, dashboards, reports, expressions, custom code, custom services, scheduled workflows, or portals | the matching `yeeflow-*-generator` skill |
| Validate a package before import or upgrade | `yeeflow-package-validator` (and `yeeflow-yapk-package-generator` for `.yapk`) |
| Classify runtime test evidence | `yeeflow-runtime-test-orchestrator` |

## Implement the authorized task

Determine whether the user wants an explanation, plan, read-only review, or implementation. Answer a self-contained control question directly. For configuration, establish the target page or form type, actual fields and variable types, source, and expected outcome. Ask only for missing information that changes the result or scope.

Prefer the hosted `yeeflow_mcp` tools for inspection, configuration, and verification. Discover the relevant capability, inspect its schema, and read the target configuration before changing it. Reuse existing resources.

Follow this plugin's write confirmation rule. Before every create, save, update, or configuration write, show the exact target application/workspace, operation, resource type, expected dependency effect, and non-destructive behavior, and obtain explicit user confirmation for that batch of writes. Obtain a separate exact-target confirmation before any delete, and a separate confirmation for credential or connection changes. A request for explanation or review does not authorize configuration, publication, or business-data changes.

If MCP lacks the required capability, fails, or leaves the behavior unclear, use the available, authorized browser tools to inspect official guidance or the Yeeflow web interface and complete the same confirmed configuration there; the same confirmation rule applies. Before switching channels or retrying a write with an uncertain result, check the current state to avoid duplicate changes. Verify and read back the result through a suitable available channel. If neither channel provides the necessary access, provide the concrete remaining steps and identify the access needed; do not invent completed changes.

For multi-resource work, follow the [application implementation lifecycle](references/application-implementation.md): establish the target and requirements, resolve prerequisites, apply small non-destructive confirmed changes, read back each saved resource, then verify affected user paths. Preserve existing identities and unspecified children. Use discovered live contracts for operations, payloads, and system-issued IDs; never guess them. Distinguish local validation, API acceptance, persisted readback, Designer editability, and runtime evidence.

Give every new variable a meaningful, readable name and editable ID before using it in bindings, expressions, or actions. Replace default or autogenerated placeholder names and editable IDs; use concise business-oriented names and a consistent identifier convention supported by the designer, such as `ApplicantEmail` or `SelectedOrderId`. A readable label alone does not make an opaque variable ID acceptable. When renaming an existing variable within the authorized scope, inspect and update its bindings, expressions, actions, workflow mappings, and other consumers together. This requirement concerns user-editable variable identifiers, not immutable system-generated record or resource IDs.

Preserve these distinctions:

- Control presentation, variable assignment, and persistence are separate. Visibility rules are not data permissions.
- Page actions and background workflow actions have different contexts. Work that must survive page navigation needs an appropriate persistent execution capability.
- Keep Lookup item IDs, display values, and business keys separate. Select Lookup List when records must populate associated detail rows.
- Layout Table is not query Data Table; source aggregation is not automatically detail-row aggregation.
- A business Status field is not the system workflow state. A workflow Connector is not an external integration or a synchronizing gateway.

Treat catalog summaries as official-document guidance, and task recipes as configuration practices. Do not infer empty-result behavior, multiple-match handling, page counts, all-record totals, refresh timing, concurrent writes, retriggering, or error propagation from a feature name. Check the relevant official article or target behavior when these matter. State the specific remaining uncertainty if evidence is unavailable.

Verify only behavior relevant to the change: actual input, output, save results, and—where needed—selection changes, missing records, access, errors, or workflow paths. Report the outcome, the references or configuration used, and the actual verification gap. Do not dump unrelated catalog content.

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
