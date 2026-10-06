# Yeeflow App Builder 1.17.0 — stable release

Adds product-provided direct Form Action execution guidance for Custom Code buttons, guarded value changes, and selected-record interactions. Includes an optional dispatch helper with shared concurrency protection, failure recovery, and an explicit variable-propagation adapter contract. All 27 Skills remain bundled; the unified MCP connection is unchanged.

The host API was supplied by the product team on 2026-10-06. Offline tests prove helper behavior with a mock host only. Target-tenant rendering, variable propagation, action-name lookup, permissions and completion semantics still require live acceptance. This release must not be described as runtime-proven.

On 2026-10-06 the owner explicitly authorized skipping the RC/install-acceptance gate, publishing stable, and upgrading the local plugin before subsequent runtime validation. Offline package tests passed; installation readback is checked separately and tenant runtime acceptance remains pending. No OpenAI store submission is included in this release operation.
