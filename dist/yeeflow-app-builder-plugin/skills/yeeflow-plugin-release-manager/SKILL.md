---
name: yeeflow-plugin-release-manager
description: Standardize Yeeflow App Builder Plugin rebuild and release workflows. Use when bundled Yeeflow skills are updated, the user asks to rebuild or update the Yeeflow App Builder Plugin, create a new plugin version, prepare a release candidate, validate a plugin package, or finalize an RC after private marketplace install smoke testing.
---

# Yeeflow Plugin Release Manager
+## Hosted MCP-Only Yeeflow Access

For live Yeeflow work, use only the appropriate hosted MCP tool. Its service negotiates authentication; standalone OAuth, local REST/API helpers, API-key fallbacks, profile/environment configuration, and direct endpoint calls are retired and must not be used. `workspace_list` is the sole workspace-discovery route. Require explicit confirmation for writes, and treat MCP acceptance as distinct from materialization and runtime proof.

## Public Tenant Safety

- Never hardcode a tenant-specific Yeeflow URL. Use `https://<yourdomain>.yeeflow.com` in docs and examples.
- Do not use API keys or local fallback credentials for live operations; use only the selected host OAuth connection.
- Derive tenant/app links from OAuth token context where available; use `YEEFLOW_TENANT_URL` only as an optional manual tenant UI/browser-link fallback and never as the API base.
- Treat `YEEFLOW_BASE_URL` as a legacy API base URL alias only, not as a tenant URL.
- Use only the host-selected OAuth connection for the requested account and organization. Local environment profiles cannot switch connected identities.
- Validate and redact environment variables before API calls and never print API keys, raw API responses, tenant IDs, private URLs, raw `Resource`, raw `Sign`, decoded payloads, or generated runtime packages.
- Keep generated examples tenant-neutral unless the user explicitly requests a target-tenant-specific package and provides safe mappings.

## Core Rule

RC tag equals build ready for testing. Final tag equals install-tested and accepted for users.

Never create a final non-RC release tag before the private marketplace install smoke test passes and the result is documented.

The next Yeeflow App Builder plugin release should include the `yeeflow-yapk-package-generator` skill, `validate-yapk-package.js`, `scripts/inspect-yapk-schema-standard.mjs`, YAPK study docs, normalized YAPK schema refs, and the safe YAPK schema summary. Do not include raw `.yapk` packages, raw `Resource`, raw `Sign`, tenant/app/list/package IDs, decoded full payloads, raw API responses, screenshots, or secrets. Adding the YAPK skill may increase the bundled skill count by one.

## Release Workflow

1. Fetch tags and latest `origin/main`.
2. Detect the latest final plugin release tag automatically. Ignore `-rc*` tags when deciding the latest final release.
3. Read the current plugin version from `dist/yeeflow-app-builder-plugin/.codex-plugin/plugin.json`.
4. Compare latest main with the latest final plugin release tag for bundled skill paths.
5. If no bundled skills changed, report that no rebuild is required and stop.
6. If skills changed, choose the next version, create a rebuild branch, rebuild the plugin folder and zip, update metadata and docs, validate, commit, push, and create an RC tag.
7. After the user confirms private marketplace install smoke passed, record the result and create the final annotated tag.

Use [plugin-rebuild-lifecycle.md](references/plugin-rebuild-lifecycle.md) for the detailed command flow.

## Versioning

Use [plugin-versioning-rules.md](references/plugin-versioning-rules.md) to choose patch or minor:

- patch for minor docs, rules, validator, packaging, or clarification updates
- minor for meaningful new capability, new bundled support skill, or runtime-proven feature expansion

Do not create a final tag as part of the rebuild task. Create only the RC tag until install smoke passes.

## Validation And Smoke

Use [plugin-release-checklist.md](references/plugin-release-checklist.md) before committing or tagging. Use [plugin-install-smoke-test.md](references/plugin-install-smoke-test.md) to document:

- install source
- Git ref
- sparse paths
- marketplace name
- plugin name
- smoke prompts tested
- UI cache or icon behavior
- install result

When running artifact checks from a source checkout, root files and `dist/yeeflow-app-builder-plugin` mirrors must be byte-identical. When running the same checks from an installed Codex plugin cache root, the root is already the plugin payload; do not require a nested `dist/yeeflow-app-builder-plugin` directory inside that cache root.

## Reporting

Report latest detected version, changed bundled skills, version decision, archive path, validation results, commit hash, branch status, RC tag or final tag, and whether plugin rebuild is still pending.

<!-- plugin-resource-access -->
## Portable access to bundled resources

Resolve this plugin's root from the current host-provided skill location: a skill is under `<plugin-root>/skills/<skill-name>`. Never hardcode a developer checkout, a macOS home directory, a Linux cache path, or a particular plugin version.

Use the skill-resource reader for files within the selected skill subtree. Shared references such as `docs/reference/...`, root validators and `core/...` are relative to the plugin root, not the current working directory. When the resource reader cannot read outside the skill subtree, read the existing shared file through the host's filesystem tools at its resolved plugin-root path. A resource-interface error alone does not prove the bundled file is missing. If no filesystem reader is available, report that access limitation; do not invent reference contents.

Resolve scripts relative to the mounted plugin and run with the host's available Node runtime. The application-generator validator entrypoint delegates to the root validator so shared dependencies resolve from the same package, including when launched from a temporary directory. Do not install dependencies or call remote write tools merely to read a template. Keep skill reads, script validation, live MCP reads, and business runtime acceptance as separate evidence.

## Unified Yeeflow MCP connection

Use the single `yeeflow_mcp` connection definition at `https://api.yeeflow.com/v1/mcp` for all live Yeeflow work. App Builder, Operations, Admin and Service Portal are capability domains within this connection, not separate servers or logins. Each account can use an independently authorized host connection to this same definition. Discover the current host-exposed tool names and schemas; do not invent namespace prefixes or assume tool contracts stayed identical after migration.

A single OAuth connection does not grant additional permissions. Operations serves business users; application structure/settings and resource creation require the appropriate application-administrator rights. Organization administration and Service Portal capabilities retain their own permission and context checks. Editor/Visitor access is not application-administrator access. On authentication failure reconnect this unified endpoint through the host; on permission denial stop the denied action without falling back to a former endpoint or another identity. Keep existing confirmation, readback, pagination, RowVersion and data-minimization rules.

## Independent sign-in and multiple connected accounts

On ChatGPT/OpenAI hosts, each user installs the same plugin and authorizes their own Yeeflow account through the host's OAuth connection flow. The host stores and selects independent connections, including additional accounts connected from plugin settings. Do not ask users to create an MCP server, supply an App ID, paste credentials, or configure local tokens. Do not implement account switching through tool arguments, local profiles, environment variables or shared credentials. Other hosts must follow their own supported connector/account-management flow; do not assume they expose OpenAI multi-account settings.

Before any account-dependent read or write, use the connection that matches the user's requested account and organization. If several connected accounts could match and the intended identity is ambiguous, ask the user to select the account and organization before accessing their business data. Do not guess from an email address alone, assume the most recently used account, or silently use every connection. If the host does not expose the requested connection or cannot route to it, preserve the operation and ask the user to select or connect that account in plugin settings; do not invent an account selector argument.

When the host exposes an authenticated profile tool, discover its actual name and schema. A designated profile tool declares `_meta["openai/profile"]: true`, accepts an empty object and returns the profile represented by the selected connection's credentials. Use its stable opaque `id` to distinguish profiles and its optional display fields for labels. Do not treat email, nickname or display name as a stable identity. A profile tool helps identification; it does not enable multi-account access or grant permissions. Do not invent a profile tool or bypass host routing when it is unavailable.

After switching connections or organizations, call `workspace_list` again and rediscover the target application/resources and permissions. Scope all reused IDs, RowVersion values, cached results and permission conclusions to the selected connection and organization; never carry them across identities. Bind write confirmation and readback to that same account, organization, target and action. If identity changes after confirmation, obtain confirmation for the new target before writing.

On authentication failure, reconnect only the affected connection. On permission denial, stop the denied operation; never retry it using another connected account. Read multiple accounts only when the user explicitly requests that scope, and label each result by its account and organization. Do not include credentials, access tokens or private profile IDs in user-facing results or generated artifacts.
