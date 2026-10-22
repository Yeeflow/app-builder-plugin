---
name: yeeflow-workflow-stage-ui
description: Configure native Yeeflow stage progress, phase visibility and task-specific Toggle defaults from actual workflow state. Use for staged approval or fulfillment forms, including editable demonstration copies.
---

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

Use the single `yeeflow_mcp` connection at `https://api.yeeflow.com/v1/mcp` for all live Yeeflow work. App Builder, Operations, Admin and Service Portal are capability domains within this connection, not separate servers or logins. Discover the current host-exposed tool names and schemas; do not invent namespace prefixes or assume tool contracts stayed identical after migration.

A single OAuth connection does not grant additional permissions. Operations serves business users; application structure/settings and resource creation require the appropriate application-administrator rights. Organization administration and Service Portal capabilities retain their own permission and context checks. Editor/Visitor access is not application-administrator access. On authentication failure reconnect this unified endpoint through the host; on permission denial stop the denied action without falling back to a former endpoint or another identity. Keep existing confirmation, readback, pagination, RowVersion and data-minimization rules.
