# Yeeflow for Grok Bot and Cursor

Grok Bot installs plugins through Cursor's plugin system, so one Cursor-format package serves both hosts. The package is separate from the OpenAI (Codex) and Claude packages and does not change them.

## Layout

| Path | Purpose |
|---|---|
| `.cursor-plugin/marketplace.json` | Repository marketplace. Points to `dist/yeeflow-cursor-plugin`. |
| `dist/yeeflow-cursor-plugin/` | Generated, committed plugin. Do not edit by hand. |
| `dist/yeeflow-cursor-plugin/.cursor-plugin/plugin.json` | Plugin manifest (name `yeeflow`, version from `package.json`). |
| `dist/yeeflow-cursor-plugin/mcp.json` | One remote MCP server, `yeeflow_mcp` → `https://api.yeeflow.com/v1/mcp`. OAuth; no headers or secrets. |
| `docs/cursor-public-readme.md` | Source for the packaged `README.md`. |
| `docs/cursor-plugin-logo.png` | 512×512 logo on a white plate (the marketplace requires 1:1 with a background). |
| `scripts/build-cursor-plugin.mjs` | Build script. |
| `scripts/test-cursor-plugin.mjs` | Freshness, manifest, MCP, skills, marketplace and host-isolation checks. Runs in CI. |

The build uses the same reviewed file selection as the Claude package (`scripts/build-plugin-archive.mjs --tracked-only`). Each `SKILL.md` gets a **Grok Bot and Cursor host requirements** section instead of the Claude one. It resolves the plugin root from the skill path or `CURSOR_PLUGIN_ROOT`, uses only the `yeeflow_mcp` OAuth connection, and reports missing Node instead of claiming validation passed.

## Rebuild

After any change to the bundled skills or shared resources:

```bash
npm run build:cursor-plugin -- --output /tmp/yeeflow-cursor.zip
npm run test:cursor-plugin
```

Commit the regenerated `dist/yeeflow-cursor-plugin/`. CI fails with `CURSOR_DISTRIBUTION_STALE` if the committed directory does not match a fresh build. If the skill count changes, update `EXPECTED_SKILL_COUNT` in the build script and the count in the test.

## Install for testing (before marketplace listing)

**Cursor team marketplace (Teams/Enterprise):** add `https://github.com/Yeeflow/app-builder-plugin` as the team marketplace from the Cursor dashboard, enable **Yeeflow**, then open Grok Bot → **Connect apps** and add it. A Teams plan allows one team marketplace.

**Individual Cursor app:** open **Customize** in the sidebar and add the repository URL as a marketplace, then install **Yeeflow**. It then appears under **Connect apps → Your plugins** in Grok Bot.

After install: **Authenticate**, sign in to Yeeflow, start a new conversation, and run the checks in [the reviewer testing instructions](grok-bot-reviewer-testing.md).

## Publish to the marketplace

Submit at https://x.ai/bot/marketplace/submit-a-plugin. One listing covers Grok Bot and Cursor; Grok chat is marked "coming soon". The form asks for:

| Field | Value |
|---|---|
| Organization name | Yeeflow |
| Organization handle | `yeeflow` |
| Website URL | https://www.yeeflow.com |
| Logotype URL | https://raw.githubusercontent.com/Yeeflow/app-builder-plugin/main/docs/cursor-plugin-logo.png |
| Where to list | Grok Bot and Cursor (and Grok when available) |
| MCP Server URL or Public GitHub Repository | https://github.com/Yeeflow/app-builder-plugin |
| Brief description | Build and maintain Yeeflow business applications, records, tasks and workflows with 31 guided skills and Yeeflow's hosted OAuth MCP server. |
| Testing instructions | The short version in [grok-bot-reviewer-testing.md](grok-bot-reviewer-testing.md), with the reviewer account details filled in. |

Submitting accepts the xAI Publisher Terms on Yeeflow's behalf, so a person authorized to do that must submit the form. Every listing is reviewed before it appears.

## Host limits

- Grok Bot runs plugins on its cloud computer and does not run plugin hooks. This package has none.
- MCP requests come from Cursor's backend, so the server must be publicly reachable. The Yeeflow OAuth server must accept the Cursor/Grok client and its redirect URIs.
- Apps are account-wide in Grok Bot: a connected Yeeflow account is available to every Bot the user runs.
