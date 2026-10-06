# Yeeflow App Builder 1.17.0 — release candidate

Adds product-provided direct Form Action execution guidance for Custom Code buttons, guarded value changes, and selected-record interactions. Includes an optional dispatch helper with shared concurrency protection, failure recovery, and an explicit variable-propagation adapter contract. All 27 Skills remain bundled; the unified MCP connection is unchanged.

The host API was supplied by the product team on 2026-10-06. Offline tests prove helper behavior with a mock host only. Target-tenant rendering, variable propagation, action-name lookup, permissions and completion semantics still require live acceptance. This candidate must not be described as runtime-proven.

Install smoke and final release acceptance are pending. No OpenAI store submission is included in this release operation.
