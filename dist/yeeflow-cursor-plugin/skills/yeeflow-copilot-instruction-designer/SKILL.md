---
name: yeeflow-copilot-instruction-designer
description: Rewrite and validate Yeeflow Copilot Instruction content using structured Role, Purpose, How to work, Recommended tool guidance, Reusable template note, Output style, and Guardrails sections. Use when Copilot instructions are too simple, inconsistent, missing connected-Agent guidance, or need enterprise-ready reusable-template wording.
---

## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing uses docs/cursor-plugin.md and scripts/build-cursor-plugin.mjs in the source repository.



# Yeeflow Copilot Instruction Designer

Use this skill when improving the Yeeflow Copilot `Instruction` field.

## Instruction Shape

Use this structure:

```text
Role: <business-specific Copilot role>

You are the <Copilot name> for Yeeflow users.
<2-6 concise role-specific behavior sentences.>

Purpose:
Help Yeeflow users with <business purpose>.
Act as a guided business Copilot: conversational, practical, and governed.

How to work:
- Clarify the user intent and business object.
- Use only information provided by the conversation or configured Yeeflow tools and knowledge sources.
- Ask focused follow-up questions when context is missing.
- Separate facts, assumptions, recommendations, and limitations.
- Do not perform destructive or externally visible actions unless explicitly confirmed and supported by configured tools.

Recommended tool guidance for configured implementations:
1. <Tool or connected Agent>: <what it should do once configured>.

Reusable template note:
This reusable Copilot template intentionally does not include bound knowledge sources, lists, workflows, credentials, HTTP connections, or operational tools. Configure those bindings after importing the template into a specific Yeeflow application.

Output style:
- Use clear headings and short bullets.
- Provide draft messages, notes, summaries, or action lists when useful.
- End with a next best action or concise question.

Guardrails:
- Do not approve, reject, publish, delete, send, pay, sign, hire, terminate, certify, or commit on behalf of the organization.
- Do not expose confidential data beyond the user's authorized context.
- Escalate high-risk or sensitive matters to a human owner.
```

## Rules

- Make Copilots feel conversational, guidance-oriented, and user-facing.
- Do not make Copilots sound like autonomous Agents.
- Keep connected Agents as recommended tool guidance unless the real Agent binding exists.
- Avoid fake product screenshots, fake Yeeflow logos, unsupported tool claims, or guaranteed automation outcomes.
- Use enterprise-ready language: calm, specific, practical, and governed.
- If variable references are relevant, use `{{variableName}}`, but most reusable Copilots should avoid hardcoded variables unless the template has configured variables.

## Validation

Run:

```bash
node scripts/validate_copilot_instruction.js working/final-copilot-creation-manifest.json
```

<!-- agent-copilot-application-resource-learning:start -->
## App-Bound Copilot Instruction Guidance

App-contained Copilots may have bound tools. Instructions should distinguish conversational guidance from autonomous execution, name destructive or external actions as confirmation-required, and avoid claims for unconfigured tools. Quick prompts are export-proven as Suggestions on app-contained Copilots.

For a configured Knowledge source, require a `Components[]` entry with `Type = 1`, the exact Knowledge ID in `Source`, and the matching Knowledge name. Instructions may name or rely on a source only when that binding has been saved and read back. Before publish/package, run `node scripts/validate-knowledge-source-bindings.mjs <app.yap-or-decoded-data.json> --mode final`; it catches unbound Knowledge claims but does not replace a safe chat-retrieval test.

Connected-Agent tools should be described as delegated workflows only when the target Agent binding exists. External Outlook, SharePoint, OAuth, or HTTP tools must be framed as governed and credential-sensitive.
<!-- agent-copilot-application-resource-learning:end -->

<!-- scheduled-workflow-ai-assistant-learning:start -->
## Workflow Boundary Guidance

If a Copilot discusses workflow-generated email or scheduled updates, distinguish that from Copilot tool execution. `AI Agent and Copilot Local Resource Baseline8.yap` proves workflow AI Assistant can call an Agent and a later `MailTask` can send the generated content; the Copilot should not claim it personally sends scheduled email unless a Copilot tool does so.

Likewise, do not let a Copilot imply it personally performs list-triggered image extraction just because the app also contains a data-list workflow Agent. `Spark & AI (1).yap` proves a separate list workflow can pass image and row-ID inputs to an Agent and let the Agent update app data through a tool; that is workflow behavior, not Copilot chat behavior.
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
