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

Status of each path as of 2026-10-28; the release each result came from is stated. "Verified" means observed in the host by Yeeflow; see the [1.20.2 release notes](releases/yeeflow-app-builder-v1.20.2.md#install-smoke) and the 1.20.1 records ([Cursor and setup](grok-bot-cursor-validation-2026-10-28.md), [Grok Bot development connection](grok-bot-dev-connection-validation-2026-10-28.md)).

| Path | Status |
|---|---|
| **Cursor local plugin**: unzip the release ZIP (check its SHA-256) and copy the folder to `~/.cursor/plugins/local/yeeflow`, then reload Cursor. Copy, do not symlink. Enterprise admins can turn off local plugins. | **Verified in Cursor (1.20.1 and 1.20.2).** The plugin, 31 skills and its own `yeeflow_mcp` connection loaded; authenticated read calls passed. On 1.20.2 the installed expression validator accepted a correct four-parameter `dateDiff` without the primitive-parameter warning. |
| Same local install, then Grok Bot | **Not observed to sync (1.20.1).** Grok Bot **Your plugins** did not show the plugin after this local install. Not re-checked on 1.20.2. |
| **Cursor personal marketplace**: Customize → Plugins → Browse Marketplace → Add Marketplace → Import from GitHub | **Not verified.** Open Cursor bug [cursor/plugins#452](https://github.com/cursor/plugins/issues/452): the import finds 0 plugins with no error. One vendor reports success after linking GitHub under Cursor dashboard → Integrations. Not tried by Yeeflow yet. |
| **Cursor team marketplace** (Teams/Enterprise): Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo | **Not verified.** Documented by Cursor. Grok Bot is documented to follow the team's connector policy; the docs do not say whether team-marketplace skills appear in Grok Bot. Requires a Teams or Enterprise plan. |
| **Grok Bot development connection**: custom MCP server plus released skills read through a private loader skill | **Ran 2026-10-28 on 1.20.1** ([results](grok-bot-dev-connection-validation-2026-10-28.md)); not yet run on 1.20.2: OAuth reads, released skill loading, bundled scripts and a declined write passed in limited form. Direct private-skill registration was not byte-identical and carries no bundled files. This is not a plugin install. |
| Grok Bot marketplace (Connect apps → search) | The public listing is not available until approved. Private distribution paths remain unverified. |

### Grok Bot development connection (pre-listing in-app test)

This tests Yeeflow's MCP and skills inside Grok Bot without the plugin package. It is how other publishers test before listing. Report it as a development connection, not as a plugin install.

**Use the step-by-step [test kit](grok-bot-dev-test-kit.md).** It replaces step 3 below with a small loader skill, because several released skills are 140–220 KB and a private skill saved through chat may not keep them byte-identical. The outline below is kept for reference.

1. In a Grok Bot chat: `Add a custom MCP server called yeeflow_mcp at https://api.yeeflow.com/v1/mcp`. Approve the card and complete Yeeflow OAuth with a test account.
2. Ask the Bot to download `yeeflow-cursor-plugin-1.20.2.zip` and its `.sha256` from the [1.20.2 release](https://github.com/Yeeflow/app-builder-plugin/releases/tag/yeeflow-cursor-plugin-v1.20.2), verify the checksum, and unzip it to `/workspace/yeeflow-plugin-1.20.2`.
3. Save representative skills as private skills from raw URLs pinned to the release tag, for example `Save this as one of your skills: https://raw.githubusercontent.com/Yeeflow/app-builder-plugin/yeeflow-cursor-plugin-v1.20.2/dist/yeeflow-cursor-plugin/skills/yeeflow-application-builder/SKILL.md`. Suggested set: application-builder, feature-configuration-guide, expression-generator, data-list-generator, mcp-incremental-application-builder.
4. Check **Connect apps → Your plugins → Manage plugins and skills → Private skills**, then start a new conversation.
5. Tell the Bot: `The Yeeflow plugin root is /workspace/yeeflow-plugin-1.20.2. Use my yeeflow-application-builder skill ...`. On desktop, name the skill in the message; the `/` menu may not open skills.
6. Run the reviewer cases and record time, skill used, MCP tools actually called, and any writes.

On 1.20.1, step 3 (direct private-skill registration) stored a reformatted `SKILL.md` without bundled scripts or references, so those skills could not resolve their files; the loader in the test kit read the released files and ran bundled scripts. Use the test kit.

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

Submitting accepts the Cursor Marketplace Publisher Terms (Anysphere) on Yeeflow's behalf, so a person authorized to do that must submit the form. Every listing is reviewed before it appears.

The form also requires ticking "I've tested this plugin locally and in-app and confirmed it works as expected". Tick it only when the evidence supports the exact attestation, and state the test boundary in Testing Instructions: the Cursor local-plugin test is a real plugin install; a Grok Bot development connection (custom MCP plus private skills) is not a plugin install. Whether that development test satisfies the attestation is unverified; ask the marketplace reviewer if needed. Do not describe MCP-only results as plugin or skill validation.

## Host limits

- Grok Bot runs plugins on its cloud computer and does not run plugin hooks. This package has none.
- MCP requests come from Cursor's backend, so the server must be publicly reachable. The Yeeflow OAuth server (`login.yeeflow.com`) advertises dynamic client registration, client ID metadata documents and PKCE S256; plugin OAuth from Cursor and custom-MCP OAuth from Grok Bot both completed on 2026-10-28.
- The packaged `scripts/test-*.mjs` files are source-repository maintainer tests. Many expect the full repository or the Codex manifest (for example `test-plugin-mcp-integration.mjs` reads `.codex-plugin/plugin.json`) and fail inside the Cursor package. Their results are not plugin or OAuth evidence. `scripts/test-skill-entrypoint-compat.mjs` is the package-level check run by `test:cursor-plugin`.
- Skill text names `docs/cursor-plugin.md` and `scripts/build-cursor-plugin.mjs`; these live in the source repository, not the package.
- Two files cited by skills are in the source repository but not in any package (Codex, Claude or Cursor): `docs/yeeflow-system-configuration-schema-specifications.md` (data-list generator, package validator) and `docs/studies/normalized/yap-export-shaped-application/reference-shape.normalized.json` (application generator). Bundling them is a shared packaging change for a later release.
- Apps are account-wide in Grok Bot: a connected Yeeflow account is available to every Bot the user runs.
