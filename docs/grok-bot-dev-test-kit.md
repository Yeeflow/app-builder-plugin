# Grok Bot development-connection test kit (Yeeflow 1.20.2)

Use this to test Yeeflow inside Grok Bot before the marketplace listing. It is **not** a plugin install: the MCP server is a custom connection and the skills are loaded by Grok Bot from the released files. Record results in a new dated validation record; do not edit the 2026-10-28 record retroactively.

The 2026-10-28 run used the 1.20.1 release ([results](grok-bot-dev-connection-validation-2026-10-28.md)). This kit now targets the 1.20.2 release; a 1.20.2 run has not been recorded yet. It extracts to a new folder, `/workspace/yeeflow-plugin-1.20.2`, so it does not collide with earlier test files.

Time: about 15–20 minutes. Account: a Yeeflow test or sandbox account. Writes: none, except an optional write that is declined at the confirmation step.

## Why a loader skill

The released skills are large (application-generator 221 KB, package-validator 176 KB, application-builder 156 KB, data-list-generator 141 KB). "Save this as one of your skills" has the Bot write the skill text, which may summarize or truncate it. The loader below is a small private skill that makes Grok Bot read the **exact released** `SKILL.md` and bundled files from the verified release on its computer. Test T2 also checks whether a directly saved skill stays byte-identical.

## Setup (in one Grok Bot conversation)

**S1. MCP connection.** If `yeeflow_mcp` is not already connected:

```text
Add a custom MCP server called yeeflow_mcp at https://api.yeeflow.com/v1/mcp
```

Approve the card and complete Yeeflow OAuth with the test account.

**S2. Released files.**

```text
On your computer, download these two files, verify the SHA-256 of the ZIP against the .sha256 file, and stop if it does not match. Then unzip the ZIP into /workspace/yeeflow-plugin-1.20.2 (create it; if it already exists, stop and tell me; do not overwrite anything else). Report the checksum, the "name" and "version" in /workspace/yeeflow-plugin-1.20.2/.cursor-plugin/plugin.json, and how many skills/*/SKILL.md files exist.
https://github.com/Yeeflow/app-builder-plugin/releases/download/yeeflow-cursor-plugin-v1.20.2/yeeflow-cursor-plugin-1.20.2.zip
https://github.com/Yeeflow/app-builder-plugin/releases/download/yeeflow-cursor-plugin-v1.20.2/yeeflow-cursor-plugin-1.20.2.zip.sha256
```

Expected: SHA-256 `3818818501e7068c387450f50917512c19ebd1f61d708b6c0851d0dc142c3a93`, name `yeeflow`, version `1.20.2`, 31 skills.

**S3. Loader skill.** Send the message below exactly, including the text between the lines.

```text
Save this as one of your skills, exactly as written, named yeeflow-dev-loader:
---
name: yeeflow-dev-loader
description: Use for any Yeeflow request (workspaces, applications, data lists, forms, workflows, dashboards, reports, expressions, AI Agents, Copilots, Yeeflow packages). Loads the released Yeeflow 1.20.2 skills from /workspace/yeeflow-plugin-1.20.2.
---
# Yeeflow development loader (pre-listing test only)

1. Plugin root: /workspace/yeeflow-plugin-1.20.2. Before anything else, confirm .cursor-plugin/plugin.json there has name "yeeflow" and version "1.20.2". If not, stop and say the test files are missing.
2. Pick the Yeeflow skill that fits the request by reading the frontmatter descriptions in skills/*/SKILL.md. If the user names a skill, use that one.
3. Read that skill's full SKILL.md from the plugin root, without summarizing it, and follow it. Resolve every bundled path it mentions relative to the plugin root or the skill folder. Report the skill path you loaded and its SHA-256.
4. Use only tools from the yeeflow_mcp connection for live Yeeflow operations. No REST calls, API keys or other connectors.
5. Before any create, update, import or delete, show the exact change and wait for explicit approval.
6. When a bundled script or reference cannot be read or run, say so. Never report validation that did not run.
---
```

**S3a. Existing loader.** If a `yeeflow-dev-loader` from an earlier run exists, replace it with the text above (or remove it first) so it points at 1.20.2.

**S4. Check the host.** Open **Connect apps → Your plugins → Manage plugins and skills → Private skills**. Confirm `yeeflow-dev-loader` is listed, then start a **new conversation** for the tests.

## Tests (new conversation)

On desktop, name the skill in the message; the `/` menu may not open skills.

| # | Prompt | Pass when | Evidence to record |
|---|---|---|---|
| T1 | `Use my yeeflow-dev-loader skill. Which Yeeflow plugin version is loaded and how many Yeeflow skills are available?` | Reports 1.20.2 and 31 from the files | Screenshot; Bot's reply |
| T2 | `Save this as one of your skills, exactly as written: https://raw.githubusercontent.com/Yeeflow/app-builder-plugin/yeeflow-cursor-plugin-v1.20.2/dist/yeeflow-cursor-plugin/skills/yeeflow-feature-configuration-guide/SKILL.md` then, in a new conversation, `Show the full text of my yeeflow-feature-configuration-guide skill and compute its SHA-256.` | Text and SHA-256 equal the released file (see table below). On 1.20.1 this failed: the host reformatted the frontmatter and stored no bundled files. Optional on re-runs. | Both SHA-256 values |
| T3 | `Use my yeeflow-dev-loader skill: show my Yeeflow user profile and list my workspaces.` | `current_user_get` / `workspace_list` called through `yeeflow_mcp`; correct user | Tool calls shown |
| T4 | `Use my yeeflow-dev-loader skill with the Yeeflow application builder skill to plan a simple visitor registration app. Do not create anything yet.` | Loaded `skills/yeeflow-application-builder/SKILL.md` (path + hash reported); plan produced; **no write tool calls** | Reported path/hash; tool calls |
| T5 | `Use my yeeflow-dev-loader skill: which Yeeflow control should I use for a dependent dropdown, and how do I configure it?` | Uses the feature configuration guide; runs or reads its bundled helper/references (bundled-resource access) | Whether the Node helper ran; any error text |
| T6 | `Use my yeeflow-dev-loader skill with the expression generator: write a Yeeflow expression for the number of days from DueDate to now, and validate it with the bundled validator.` | 4-parameter `dateDiff`; validator actually runs and returns `valid: true` with **no** `EXPRESSION_FUNCTION_PRIMITIVE_PARAM` warning (fixed in 1.20.2). A `PARAM_COUNT` warning means a 3-parameter call. | Expression; validator output |
| T7 | `Use my yeeflow-dev-loader skill: create a data list called Review Test with a Title field in workspace <test workspace>.` then answer **`No, do not create it.`** | Shows the exact change and waits; after "No", **no create call** | Confirmation text; tool calls |

Released 1.20.2 SHA-256 values for comparison (these changed from 1.20.1 because the skill guidance links changed):

| File | SHA-256 |
|---|---|
| `skills/yeeflow-feature-configuration-guide/SKILL.md` | `b67fdbf5feccdfaa5fbbf7c14d26f325b48b9aa8c85dec4eb321c2301f00a5d8` |
| `skills/yeeflow-application-builder/SKILL.md` | `c7c9ec1fe57f3637cee918f4cec1e258024e6b8a3f912744e313e9b6129dcf99` |

## Reporting

Report as: "Grok Bot development connection: custom MCP plus released skills loaded through a private loader skill." List each test as PASS, FAIL or NOT RUN with the evidence above. This is in-app evidence for Yeeflow's MCP and skills in Grok Bot. It is not evidence of marketplace plugin installation, which can only be tested after approval.

Clean-up after testing: optionally remove `yeeflow-dev-loader` and the saved feature-guide skill from Private skills, and delete `/workspace/yeeflow-plugin-1.20.2` (and earlier test folders such as `/workspace/yeeflow-dl` and `/workspace/yeeflow-tests` once they are no longer needed as evidence).
