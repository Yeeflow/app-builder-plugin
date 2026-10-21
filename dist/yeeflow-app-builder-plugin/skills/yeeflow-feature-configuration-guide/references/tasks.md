# Reusable configuration tasks

Load only the relevant task below. These are configuration practices, not promises about unspecified runtime behavior.

## T01 Choose and bind a control

Inputs: page type, business purpose, field type, scalar or multiple values, readable variable name and editable ID, existing fields, and edit requirements. Inspect existing definitions; select a compatible native control; replace default variable names and editable IDs before configuring binding, defaults, and validation. Output: control choice and field mapping. Verify input, save, readonly display, and reopening without duplicating existing fields.

## T02 Related selection and field mapping

Inputs: source, record identity, business key, display field, filters, selection mode, target fields, and empty-result policy. Configure Lookup or Lookup List as appropriate. Use matching types; define selection changes and missing or multiple records. Output: source-to-target mapping and related actions. Verify that stale values cannot be mistaken for a new result.

## T03 Rules and expressions

Inputs: context, input types, conditions, and expected effect. Distinguish visibility, readonly behavior, validation, style, and execution conditions. Use only the variables and functions available in that scenario. Output: rule meaning and expressions. Verify both outcomes, empty values, and precision.

## T04 Query and display records

Inputs: source, row grain, fields, filters, ordering, pagination, permissions, and freshness. Choose the appropriate Data Table, Collection, chart, or report. Connect filter variables to the actual query. Output: data contract and display configuration. Verify paging, totals, empty results, and access.

## T05 Write data and handle results

Inputs: target, operation, matching conditions, field mapping, execution context, and success or failure requirements. Distinguish form assignment from persistence and page actions from background actions. Configure explicit targets and supported result handling. Output: write conditions and downstream decisions. Verify success, failure, affected records, and any required concurrent behavior; a prior query does not establish atomicity.

## T06 Coordinate forms and workflows

Inputs: participants, submission and task pages, variables, branching, completion, and recall requirements. Associate forms and tasks; configure assignees and gateways according to the intended synchronization. Output: page-to-task and variable mappings. Verify relevant success, rejection, recall, and branch paths while separating business status from system state.

## T07 Reports and aggregation

Inputs: sources, relationship keys, row grain, metric definitions, permissions, and refresh needs. Choose Form Report or Data Report; inspect sublist and join multiplication before aggregation. Output: fields and metric definitions. Reconcile detail and totals and check that the chosen source is sufficiently fresh for the use case.

## T08 Choose page or background execution

Inputs: trigger, running identity, page-context dependencies, and interruption requirements. Page actions suit active interaction, queries, assignments, confirmation, and navigation. Work that must continue after navigation requires a suitable persistent execution capability. Output: execution location and rationale. Verify behavior on refresh, navigation, and relevant failures.
