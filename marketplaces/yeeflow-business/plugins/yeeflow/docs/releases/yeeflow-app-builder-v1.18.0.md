# Yeeflow App Builder 1.18.0

Adds the `yeeflow-feature-configuration-guide` skill for choosing, configuring and troubleshooting individual Yeeflow features. The plugin now bundles 28 Skills for Codex and Claude; the unified MCP connection is unchanged.

## New skill: Yeeflow Feature Configuration Guide

- Explains, selects, configures and troubleshoots controls, fields, form and page actions, data lists, filters, workflow steps, reports, dashboards and portals.
- Grounded in a catalog of 287 features, each a concise English paraphrase of an official Yeeflow Help Center article with its source link (material date 2026-10-15). 21 entries carry additional configuration considerations.
- Loads knowledge on demand through a read-only Node helper: `scripts/knowledge.mjs search "<query>" [--domain <domain>] [--limit <n>]` and `scripts/knowledge.mjs read <FEATURE-ID>...`. Without Node execution, the skill reads `references/feature-catalog.json` directly.
- Includes an objects and look-alike names guide (Lookup vs Lookup List, Table vs Data Table, business Status vs workflow state, page vs workflow actions), eight reusable configuration recipes, and an application implementation lifecycle aligned with this plugin's evidence levels.
- Requires readable variable names and editable IDs before variables are used in bindings, expressions or actions.
- Follows the plugin's existing write rule: explicit confirmation before every write batch, with separate confirmation for deletes and credential or connection changes.
- Routes whole-application builds, generation, package validation and runtime-evidence work to the existing specialist skills.

The skill was contributed as `yeeflow-implementation` and renamed for clarity. Its 287 per-feature files were folded into one catalog file; search results match the original helper on 2,529 test queries and every entry renders identically.

## Validation boundaries

Offline checks only: package build, skill inventory and payload parity for Codex and Claude, unified MCP checks, relative-reference gates, and helper parity. The catalog paraphrases official articles and was not re-fetched live for this release; no tenant runtime test was performed. Install and use acceptance in Codex and Claude remain pending.
