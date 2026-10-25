# Document workflow project patterns

Use these practices when the target requirement calls for staged forms, rule-loaded document rows or related archives. They are not new product API contracts. Preserve existing user changes and the selected page template; confirm actual host support before generating payloads.

## Form layout and density

Map related fields before choosing two/three-column Grids. Use nested Grids for groups that need different tracks; avoid unnecessary `column-span:2` on single-file uploads. Keep files that are actually multiple (for example, a set of drawings) multiple. Do not infer cardinality from a screenshot.

Follow the user's accepted field spacing instead of mechanically setting every field margin to zero. Shared Grid gap/padding may already provide spacing. Existing mandatory templates, including Public Form zero-margin field conventions, take precedence unless the user explicitly changes them. Do not introduce universal fixed margins, theme colors, corner radii or column counts from one project.

Compact status/Boolean metadata columns need less width than file names, addresses, business scopes or notes. Keep short-value cells and upload controls aligned; check the rendered attachment wrapper, not only the header. Use natural wrapping or textareas for long input, and contained horizontal scrolling or supported native mobile cards when wide rows cannot fit. Verify both header and body alignment.

Use distinguishable but related heading levels. Native collapsible Grids or Toggles avoid duplicate decorative headings. For approved designs, a lighter secondary caption and small corner radius can clarify hierarchy. Retain expand/collapse affordances and keyboard behavior.

## Document rules and row schema

Separate category, optional subtype and document content. Use subtype to split tables only when their business fields differ (for example, license, permit and trademark). Keep common row field IDs/labels consistent where supported, and map specialized fields explicitly. Do not repeat category names in every document label without a business reason.

Store applicability, enabled choice, document order, required flag and OCR applicability only when the requirement uses them. If users maintain yes/no state as single-choice options, do not substitute a checkbox silently. Match source and consumer IDs/types, not display labels alone. Keep rule-loaded source order distinct from ordinary newest-first lists.

Apply only the requested applicability dimension. If filtering by secondary business category is sufficient, do not add redundant cascading queries for every category. Common documents should remain common under the declared policy. Unknown category assignments and area boundaries are business decisions; do not invent them from names when ambiguous.

Hide an explicit “required” display column when the agreed UI instead appends a conditional red `(*)` to the document label. Keep the underlying required flag and validation intact; do not modify the stable document type/cache key or permanently append an asterisk to source names.

## State-driven validation

Define option semantics per target. In the tested project: N/A skips file/notes checks, provided requires an attachment, and missing requires a reason while approval remains possible. These are configured business rules, not universal platform defaults.

Recalculate both requirements and prior error state on every status change. Switching to N/A must clear obsolete file/reason errors without clearing existing files or notes. Use the native conditional-validation behavior when it is proven on the target host. If the platform caches errors, test an authorized minimal alternative and report its limits; do not treat hiding a message as fixing validation or use an unrelated field reset that destroys data.

## Data scope and loading

Scope priority (all → Team → own) applies only after the current user's permitted membership is confirmed. Do not briefly show all data while awaiting membership. Unknown/failed membership is not Management. Use the configured AM-to-tenant-to-contract relation; never infer Team from a record's stale copied label.

A group/view filter does not create source authorization. Test actual record isolation with appropriate accounts before claiming security coverage. A single Management account can validate its view results but cannot prove another role's access restrictions.

Load only the initial permitted page and optional related detail counts needed for the user journey. Distinguish first-page-ready, index-ready, detail-render and end-to-end time. Long variable names affect maintainability; they are not evidence of a network bottleneck. Preserve correct totals when changing page size, and use selection revisions/cancellation to prevent old tenant data appearing after a new selection.

## Runtime evidence

Retain independent proof levels for API acceptance, exact persisted configuration, Designer editability, native publish success, runtime rendering and actual approval/writeback. A published boolean alone does not identify the new deployed version. Native Preview may disable attachment upload; use an authorized actual form for upload behavior.

Exercise relevant boundaries: status → N/A, identical bytes with different upload IDs, same hash/different type, late OCR response, tenant A → B, role-priority initialization, stage1 → stage2 and narrow viewports. Use configured synthetic records and authorized accounts. Before mutation, check the exact test assignee, source records and side effects. Track and restore temporary setup; do not infer authorization to delete diagnostics, send notifications or activate third-party services.

## Route to orchestration skills

- Actual task progress and phase-specific task pages: `skills/yeeflow-workflow-stage-ui/SKILL.md` from plugin root.
- Single-attachment OCR, cache and retry: `skills/yeeflow-attachment-ocr-orchestrator/SKILL.md`.
- Versioned reuse and approval-time archive writeback: `skills/yeeflow-document-archive-lifecycle/SKILL.md`.

The pure planning utilities in `scripts/lib/document-workflow-patterns.mjs` are tested locally. They do not read Yeeflow, authorize an action, generate a complete form/workflow, execute OCR or write an archive record.
