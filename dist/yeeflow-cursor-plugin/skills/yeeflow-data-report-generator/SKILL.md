---
name: yeeflow-data-report-generator
description: Create, inspect, update, validate, and safely delete Yeeflow Data Report definitions through the bundled App Builder MCP. Use for derived reports sourced from Data Lists, Document Libraries, Form Reports, or other Data Reports.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing is documented in the source repository at https://github.com/Yeeflow/app-builder-plugin/blob/main/docs/cursor-plugin.md (not bundled in this package).



# Yeeflow Data Report Generator

Use this skill for the **Data Report definition lifecycle**, not to mutate rows emitted by a report. A Data Report is a read-only derived resource: its definition can be created, updated, or deleted; report output must not receive add/edit/delete record actions.

## Proof Boundary

The initial live baseline comes from two redacted business reports in Service Desk Pro. It proves the persisted `DataReport` component envelope and an observed stage pipeline of `input`, `group`, `join`, `map`, and `output`. It does **not** prove that arbitrary SQL, stage types, schedules, or consumer UI behaviour will run.

Read [references/data-report-live-contract.md](references/data-report-live-contract.md) before generating a report. Never copy tenant IDs, source IDs, SQL, or schedules from a reference report.

## Required MCP Workflow

1. Read `appbuilder_component_contract` for `DataReport`, then list the target application's components. Resolve every source component and field from the current app; do not reuse example IDs.
2. Produce a Data Report plan containing source resources, selected source fields, output fields, a stage graph, refresh policy, and intended consumers. Ask for a decision when merge/append/filter/deduplication semantics are ambiguous.
3. Obtain all new numeric IDs with the App Builder MCP ID utility. Assemble a complete `detail` payload with `Model`, `List`, non-empty `Fields`, and a default Type `0` layout. Set `List.Type` to `64`.
4. Before `appbuilder_component_save`, run:

   ```bash
   node scripts/validate-data-report-detail.mjs --input <detail.json>
   ```

5. Save only after the validator passes, then `appbuilder_component_get` the exact component and run the validator again on the readback. State API acceptance and persisted readback separately.

For update, first read the complete existing component, preserve unknown properties, and use `deleteMissing: false` unless explicit removal is intended. Revalidate the full replacement graph before saving; a partial field edit may break the stage/output mapping.

For deletion, list and assess dashboard, workflow, navigation, and report dependencies; require an exact component-name confirmation; call `appbuilder_component_delete`; then list/read back to verify absence. Deletion is irreversible.

## Initial Generation Profile

The only generation profile supported by this skill without a new live baseline is:

```text
input (Data List source) -> group -> optional join -> optional map -> output
```

- Use `input` for each explicitly selected current-app Data List source.
- Use `group` only for clearly stated aggregates and grouping keys.
- Use `join` only with explicit left/right key and desired join semantics.
- Use `map` for named calculated output columns; guard division by zero and preserve data types.
- Use one final `output` stage. It must be last.
- Give the result a native `Title` text field at index `0`, then unique physical output fields with matching `FieldName`, `InternalName`, IDs, and types.
- Start with refresh disabled. Enable a schedule only when the user states a business cadence and time zone; never inherit an example's schedule.

Do not generate Append, Merge variants, filter, remove-duplicate, non-Data-List sources, or unobserved stage types as production-ready definitions until a focused live component contract/readback baseline validates their exact shape.

## Fail-Closed Rules

- `Model.Settings.Stages` must be non-empty, use supported observed types, have unique IDs/output tables, and end with exactly one `output` stage.
- Each non-input stage must depend on prior stage output table(s); a join must resolve two prior tables.
- `Fields` must all belong to `List.ListID`; report definitions must not seed `List.Items`.
- The report's list resource is Type `64`, has one default Type `0` layout, and has an export-shaped `LayoutView`.
- Treat a successful save/get as persistence evidence only. For a report used in a Dashboard, Collection, workflow, or data control, execute a focused consumer smoke test before claiming it is usable.

## Evidence Report

Report these levels independently:

| Level | Meaning |
| --- | --- |
| API accepted | `component_save` accepted the definition. |
| Persisted readback | `component_get` returned the saved definition and validator passed. |
| Designer-open | The Data Report opens in Designer without schema/stage errors. |
| Consumer runtime | The intended dashboard/workflow/data control refreshes and renders expected output. |

The first two levels never prove the last two. Include unattempted levels and the exact next required test.

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
