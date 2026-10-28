# Application implementation

Load this reference for application-level or multi-resource implementation, dependency changes, package delivery, or runtime troubleshooting. For a single control question, use the relevant catalog entry instead.

## 1. Choose the delivery path

| Request | Approach |
| --- | --- |
| Explain, compare, plan, or review | Inspect only; give a focused answer or a concrete plan. |
| Create or extend a live application | Prefer discovered MCP operations in small, resumable, confirmed batches; for a whole application or many resources use `yeeflow-application-builder` / `yeeflow-mcp-incremental-application-builder`; use the browser fallback from the main Skill when needed. |
| Export, migrate, install, or upgrade a package | Establish the requested artifact and target; use `yeeflow-package-validator` (and `yeeflow-yapk-package-generator` for `.yapk`) plus the package checks below. |

A live application request does not imply package generation. A package request does not authorize installation, publication, or access changes outside its stated scope. Ask about scope only when missing information materially changes the target or outcome, but always follow the plugin's write confirmation rule in step 4.

## 2. Define the target and acceptance

Resolve the actual account/workspace, application, resource, and environment through current inspection. Never select a target solely from remembered IDs, examples, a previous session, or local defaults. For substantial work, write a compact plan containing:

- Intended user journeys and outcomes.
- Required resources, existing resources to reuse, and dependencies.
- Field/variable names, editable IDs, types, persistence, and Lookup relationships.
- Page layout, data source, filters, actions, permissions, and workflow paths that matter.
- Acceptance checks and explicitly deferred resources.

Do not add placeholder pages, static business totals, assumed approval policies, or unrequested resources to make a plan look complete. Preserve the user's chosen design.

## 3. Inspect contracts and dependencies

Discover the actual MCP capabilities and schemas. Do not guess tool names, endpoint paths, required properties, component type numbers, identifier formats, or supported operations. Use authenticated host connections; do not ask for passwords, tokens, cookies, or API keys in chat. Connection and credential configuration must use the available secure entry/reference mechanism.

Read the complete affected resource and its consumers before mutation. Preserve system fields and live application, list, field, layout, and workflow identities. Obtain new immutable IDs from the platform's supported allocation/create mechanism. Human-readable editable variable IDs follow the main Skill's naming rule; that rule never permits replacing immutable system identities.

Build prerequisites before consumers: application context and shared foundations, lists/fields and relationships, forms/workflows, dependent reports and dashboards, then navigation and intended access. This is a dependency guide, not a mandatory order for every task. Resolve circular references in stages supported by the current contract, with readback between stages.

## 4. Apply and resume safely

For a multi-step build, keep a compact task-local progress record with resource purpose, live identity, dependencies, intended change, save/readback result, and remaining checks. Keep credentials, raw tenant exports, and sensitive business records out of reusable Skill files and shared reports. Do not require a ledger for a trivial control edit.

1. Inspect the target and preserve a suitable current-state record for the affected scope.
2. Prepare the smallest contract-valid change; preserve unspecified fields and children. Use non-destructive merge/missing-resource options only where the discovered contract supports them.
3. Show the exact target, operation, resource type, dependency effect, and non-destructive behavior for the batch, and obtain explicit confirmation before applying it. Obtain a separate exact-target confirmation for any delete and for credential or connection changes. An update does not imply deletion, replacement, permission broadening, or public exposure.
4. Read back the exact resource and compare intended values, stable IDs, bindings, and prerequisites.
5. Advance dependent work only after the prerequisite is verified. If a write times out or its result is uncertain, inspect current state before retrying or switching to the browser.
6. On resume, reconcile recorded progress with live state. Pause only conflicting dependent writes; continue unrelated safe work. Ask for a decision if reconciliation would change the agreed result or overwrite another change.

Create navigation links only after their targets exist and pass readback. For access changes, verify the intended role/group and actual scope. Do not treat visibility conditions as authorization.

## 5. Verify the feature in its execution context

| Area | Focused acceptance checks |
| --- | --- |
| Lists, forms, and Lookup | Correct fields/types and persistence; actual source and target bindings; labels versus record IDs; newly created target selectable in the consumer's actual New/Edit picker where relevant. |
| Expressions and page actions | Correct expression editor/context and supported types/functions; declared variable bindings; selection and empty-result behavior; save and error outcomes. Do not assume a custom interaction supplies native row context. |
| Dashboards, Collections, filters, and KPIs | Real data sources and filter propagation; correct record details and aggregates; change selection from record A to B and check stale A-only content disappears. A rendered page alone proves no data or action behavior. |
| Approval and scheduled workflows | Actual trigger context, conditions, assignees, relevant approval/rejection/error paths, persistence, notifications, and schedule/time-zone meaning. Avoid test submissions that create unapproved business effects. |
| Reports | Source form/list, field mappings, persisted columns and views, then relevant row population, filters, detail links, or export. A mapping definition alone does not prove a usable report. |
| Navigation, portals, and permissions | Links resolve to intended live resources; authorized role can perform the intended journey; access boundaries and public exposure match the request. |

Use native controls and supported configuration when they satisfy the task. Use official Custom Code extensions only when needed and authorized; discover the actual host capabilities and test context, action execution, asynchronous value updates, and errors. Do not copy an assumed SDK contract or template recipe from an unrelated example.

For visual changes, check actual field content, narrow layouts, readable titles/identifiers, and access to full truncated values. Preserve existing pagination and design semantics unless the task requires a change.

## 6. Package delivery, only when requested

Identify the requested artifact and the official tools available for that format. Verify planned-resource completeness, unique/stable identities, relationship targets, workflow references, navigation, and consumer bindings. Preserve application identity for an authorized upgrade. Do not fabricate package wrappers, signatures, embedded resource formats, or server-generated payloads.

Use the plugin's bundled validators through `yeeflow-package-validator`, resolving them from the plugin root (`<plugin-root>/...`), not the current working directory. If Node execution or the validator is unavailable in the host, report the missing validation and perform only supported inspection. Do not claim schema validity, import readiness, successful installation, or runtime acceptance without the corresponding evidence. Do not import with unresolved blocking issues.

Package only the intended deliverable. Exclude credentials, private exports, raw tenant responses, screenshots containing private data, and local caches from reusable/shared packages.

## 7. Report evidence precisely

Keep these levels separate: local structural validation; API acceptance; persisted readback; Designer open/edit/save; runtime user action. Each proves its own tested scope. Neither a successful import nor a successful save establishes that the application works.

For each material feature, report the action and observed result, using a narrow status such as runtime proven, partially proven, render only, blocked by configuration, blocked by package/materialization, blocked by runtime context, or not tested. Identify the specific missing check and next step. A feature that passed does not prove neighboring features.

## Related skills in this plugin

Load these only when the task needs them:

- `yeeflow-application-builder`: requirements-to-application planning and the confirmed build path.
- `yeeflow-mcp-incremental-application-builder`: step-by-step live resource changes, build ledger, and resume rules.
- `yeeflow-package-validator`: package validation lifecycle before import or upgrade.
- `yeeflow-runtime-test-orchestrator`: runtime result classification and evidence reporting.
