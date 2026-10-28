# Grok Bot development-connection results — 2026-10-28

Package: Yeeflow for Grok Bot and Cursor **1.20.1** (release `yeeflow-cursor-plugin-v1.20.1`, ZIP SHA-256 `42200a36dc89d6f8aafa6df955650d4bcc5e50c1c2f69752356524d32420be10`)
Procedure: [Grok Bot development-connection test kit](grok-bot-dev-test-kit.md)
Status: **Released skills ran in Grok Bot through a private loader skill and a custom MCP connection. This is not a Grok Bot plugin installation. All 31 skills and full live workflows were not verified. Not submitted.**

## What this test is, and is not

| Mechanism | What it means | Result |
|---|---|---|
| **Plugin installation** (Yeeflow plugin in Grok Bot **Your plugins**, with its own connector and 31 skills) | The marketplace experience reviewers and users get | **Not achieved.** No verified way to install an unlisted plugin from an individual Grok Bot account. |
| **Direct skill registration** (one `SKILL.md` saved through Grok Bot's private-skill tool) | The host registers one skill from its text | Host-recognized, but **not byte-identical**, and without the skill's bundled scripts or references (T2) |
| **Loader** (a small private skill that reads the checksum-verified released files on the Bot's computer) | Released skill text and bundled files used inside Grok Bot | Worked for the cases below (T1, T3–T7) |
| **Custom MCP connection** (`yeeflow_mcp` added manually) | Yeeflow tools with OAuth, outside any plugin | Worked (T3) |

## Evidence boundary

- Results are the Grok Bot agent's reported file, tool and script evidence, plus the confirmation UI Yeeflow observed. Raw transport traces were not exported.
- No Yeeflow writes were made.
- Test files and draft payloads remain on the Bot's computer under `/workspace/yeeflow-dl/extracted` and `/workspace/yeeflow-tests`.

## Results

| # | Test | Result | Evidence and limits |
|---|---|---|---|
| Setup / T1 | Released files and version | **PASS** | ZIP SHA-256 matched; manifest `yeeflow` `1.20.1`; 31 skill files. `/workspace/yeeflow-plugin` already held a clone, so the files were extracted to `/workspace/yeeflow-dl/extracted` without overwriting, and the loader was adapted to that path. |
| T2 | Direct skill registration stays byte-identical | **FAIL (by the kit's criterion)** | A plain filesystem copy was byte-identical but not registered by the host. Saving through the private-skill tool registered the skill, but it stored SHA-256 `055516f3…63ed0b` versus released `35771900…e53308`. The Bot reports the frontmatter `description` was reformatted and a blank line removed; body text identical. The saved skill folder holds only `SKILL.md`, so relative scripts and references cannot resolve from it. |
| T3 | OAuth reads through `yeeflow_mcp` | **PASS** | Existing custom connection; `current_user_get`, `get_profile`, `workspace_list` succeeded; correct user, eight workspaces. |
| T4 | Application builder, plan only | **PASS (limited)** | Loaded from the verified extract; reported hash `ec8b2d2e…780b7a38` matches the release. Visitor-registration plan produced; no writes. Planning validators were not run. |
| T5 | Feature guide and bundled resources | **PASS (limited)** | Bundled references read and `knowledge.mjs` ran (bundled-resource access works through the loader). The dependent-dropdown answer partly relied on inference; refresh and clearing behaviour were not tested. |
| T6 | Expression validator on `dateDiff` | **Ran; known validator issue** | Four-parameter `dateDiff`: `valid: true` plus `EXPRESSION_FUNCTION_PRIMITIVE_PARAM`, the conflicting-rule warning fixed in PR #24 (not released). The Bot also reported differing copies of `yeeflow-expression-utils.js`; see "Follow-up" below. Designer and runtime behaviour not tested. |
| T7 | Confirmation before writing | **PASS (pause and decline only)** | Asked to create a Review Test list in Codex Lite, the Bot described the changes and asked which application to use; "Don't create anything" was selected and it confirmed no Yeeflow change. This shows a pause and a declined write, not a complete approved-write flow. |

## Findings

1. **Direct private-skill registration is not a substitute for the package.** The host re-serializes frontmatter (the feature guide's long unquoted `description` contains quoted phrases), and it stores only `SKILL.md`, so skills that use bundled scripts or references cannot run that way. Use the loader for pre-listing tests.
2. **The loader approach works for reading released skills and running bundled scripts in Grok Bot.** It depends on files the user places on the Bot's computer; it does not show how the marketplace plugin will behave.
3. **Validator copies.** The packaged copies of `yeeflow-expression-utils.js` differ for two reasons. Some differences are the build's reference-path rewrites (recorded in `claude-shared-resources.json`, expected). The application-generator and approval-form-generator copies also missed a 2026-09-11 change and still reject list-valued variables. Both issues are fixed in PR #24, which is not yet released.

## Not tested

- Grok Bot plugin installation (only possible after listing, or through a private distribution path not yet verified).
- The remaining skills in Grok Bot; full live business workflows; any approved write.
- A dedicated reviewer account.
