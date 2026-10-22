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
