---
name: yeeflow-agent-prompt-designer
description: Rewrite and validate Yeeflow AI Agent Persona & Prompt content using structured Role, job, goals, skills, inputs, workflow, output format, and constraints sections with {{variableName}} references. Use when Agent prompts are too simple, inconsistent, missing variable references, or need enterprise-ready reusable-template wording.
---

## Claude host requirements

If the Skill tool reports a virtual or missing base directory, do not assume bundled files are missing. When filesystem tools are available, locate .claude-plugin/plugin.json under the host-provided plugin mounts, verify its name is yeeflow and version matches this session, and resolve resources from that actual root. Do not use another installed version or another host cache. If multiple roots match, stop and report ambiguity.

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CLAUDE_PLUGIN_ROOT when provided. Read bundled resources with Claude's available file tools. Resolve shared docs, scripts and core from the plugin root, never from a developer checkout or another host's cache.

Use only the discovered tools of this plugin's unified yeeflow_mcp connection. Authenticate through Claude's connector/MCP OAuth flow. Never copy OpenAI login tokens or invent tool namespace prefixes. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the host's available Node runtime. File execution is available only where Claude supplies a filesystem and execution tools. In chat, report missing execution access and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Do not edit installed plugin caches or another host's skills. Put learning changes in an explicitly selected development checkout and rebuild this Claude package there. Maintainer references describing Codex/OpenAI publishing are for those platforms; Claude publishing uses docs/claude-plugin.md and scripts/build-claude-plugin.mjs in the source repository.



# Yeeflow Agent Prompt Designer

## Prompt Shape

Use this structure for Yeeflow AI Agent `Persona & Prompt` fields:

```text
Role: <business-specific role name>

You are an AI assistant for <business purpose>.

Your job is to:
- ...

Goals:
- ...

Skills:
- ...

Inputs:
- {{inputVariable}} (Type): Short description.

Workflow:
1. ...

OutputFormat:
Return the configured output variables only. Use the output variable names exactly:
- {{outputVariable}} (Type): Short description.

Constraints:
- ...
```

## Rules

- Reference every configured input and output variable as `{{variableName}}`.
- Preserve the exact variable names from the manifest.
- Keep the tone calm, practical, structured, and enterprise-ready.
- Do not imply unavailable tools. Say tools are deferred unless configured by an admin.
- Avoid legal, HR, finance, compliance, or commercial final decisions. Recommend human review where appropriate.
- Prefer clear output instructions over generic chatbot behavior.

## Validation

Run `scripts/validate_prompt_refs.js <manifest.json>` after updating prompts.

<!-- agent-copilot-application-resource-learning:start -->
## App-Bound Tool Prompt Guidance

App-contained Agents can have Components for knowledge, list query/create/update/delete tools, connected application connections, and connected Copilot/Agent orchestration. Prompt text may describe those tools only when the bindings are actually present. For destructive tools such as delete-by-ID, require record identification, ownership checks, dependency checks, and human-readable blocked/deleted responses.

For a Knowledge source, the real binding is `Components[]` with `Type = 1` and `Source` equal to the returned Knowledge resource ID; the displayed component name must match that resource. Do not write “use the <Knowledge name> knowledge base” unless this binding has been saved and read back. Validate the application package with `node scripts/validate-knowledge-source-bindings.mjs <app.yap-or-decoded-data.json> --mode final`; this proves configuration consistency, not retrieval execution.

Do not imply Outlook, SharePoint, HTTP, OpenAPI, document generation, image generation, image analysis, code interpreter, MCP, or Services runtime access unless the specific tool component is present and validated.
<!-- agent-copilot-application-resource-learning:end -->

<!-- scheduled-workflow-ai-assistant-learning:start -->
## Workflow-Called Agent Prompt Guidance

Agents called by workflow AI Assistant actions should have explicit input and output variable instructions that match the workflow mapping. The `Email generation` Agent export uses input `QueryItems` and outputs `Subject` and `Body`; prompt text asks for an email subject and inline-style HTML body. Do not imply the Agent sends email itself unless a separate `MailTask` is configured.

`Spark & AI (1).yap` extends this rule for image extraction Agents in data-list workflows: declare the image input explicitly as `type = "img"`, declare a separate text input for the originating row ID, and describe exactly how the Agent should use any application-resource access tool to update the correct row. Do not make the prompt guess which row to mutate when the workflow can pass `ListDataID` directly.
<!-- scheduled-workflow-ai-assistant-learning:end -->

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
