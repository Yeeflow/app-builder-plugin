# Grok Bot development-connection test kit (Yeeflow 1.20.1)

Use this to test Yeeflow inside Grok Bot before the marketplace listing. It is **not** a plugin install: the MCP server is a custom connection and the skills are loaded by Grok Bot from the released files. Record results in a new dated validation record; do not edit the 2026-10-28 record retroactively.

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
On your computer, download these two files, verify the SHA-256 of the ZIP against the .sha256 file, and stop if it does not match. Then unzip the ZIP into /workspace/yeeflow-plugin (create it; do not overwrite anything else). Report the checksum, the "name" and "version" in /workspace/yeeflow-plugin/.cursor-plugin/plugin.json, and how many skills/*/SKILL.md files exist.
https://github.com/Yeeflow/app-builder-plugin/releases/download/yeeflow-cursor-plugin-v1.20.1/yeeflow-cursor-plugin-1.20.1.zip
https://github.com/Yeeflow/app-builder-plugin/releases/download/yeeflow-cursor-plugin-v1.20.1/yeeflow-cursor-plugin-1.20.1.zip.sha256
```

Expected: SHA-256 `42200a36dc89d6f8aafa6df955650d4bcc5e50c1c2f69752356524d32420be10`, name `yeeflow`, version `1.20.1`, 31 skills.

**S3. Loader skill.** Send the message below exactly, including the text between the lines.

```text
Save this as one of your skills, exactly as written, named yeeflow-dev-loader:
---
name: yeeflow-dev-loader
description: Use for any Yeeflow request (workspaces, applications, data lists, forms, workflows, dashboards, reports, expressions, AI Agents, Copilots, Yeeflow packages). Loads the released Yeeflow 1.20.1 skills from /workspace/yeeflow-plugin.
---
# Yeeflow development loader (pre-listing test only)

1. Plugin root: /workspace/yeeflow-plugin. Before anything else, confirm .cursor-plugin/plugin.json there has name "yeeflow" and version "1.20.1". If not, stop and say the test files are missing.
2. Pick the Yeeflow skill that fits the request by reading the frontmatter descriptions in skills/*/SKILL.md. If the user names a skill, use that one.
3. Read that skill's full SKILL.md from the plugin root, without summarizing it, and follow it. Resolve every bundled path it mentions relative to the plugin root or the skill folder. Report the skill path you loaded and its SHA-256.
4. Use only tools from the yeeflow_mcp connection for live Yeeflow operations. No REST calls, API keys or other connectors.
5. Before any create, update, import or delete, show the exact change and wait for explicit approval.
6. When a bundled script or reference cannot be read or run, say so. Never report validation that did not run.
---
```

**S4. Check the host.** Open **Connect apps → Your plugins → Manage plugins and skills → Private skills**. Confirm `yeeflow-dev-loader` is listed, then start a **new conversation** for the tests.

## Tests (new conversation)

On desktop, name the skill in the message; the `/` menu may not open skills.

| # | Prompt | Pass when | Evidence to record |
|---|---|---|---|
| T1 | `Use my yeeflow-dev-loader skill. Which Yeeflow plugin version is loaded and how many Yeeflow skills are available?` | Reports 1.20.1 and 31 from the files | Screenshot; Bot's reply |
| T2 | `Save this as one of your skills, exactly as written: https://raw.githubusercontent.com/Yeeflow/app-builder-plugin/yeeflow-cursor-plugin-v1.20.1/dist/yeeflow-cursor-plugin/skills/yeeflow-feature-configuration-guide/SKILL.md` then, in a new conversation, `Show the full text of my yeeflow-feature-configuration-guide skill and compute its SHA-256.` | Text and SHA-256 equal the released file (see table below). If not, direct private-skill saving is not reliable for Yeeflow skills. | Both SHA-256 values |
| T3 | `Use my yeeflow-dev-loader skill: show my Yeeflow user profile and list my workspaces.` | `current_user_get` / `workspace_list` called through `yeeflow_mcp`; correct user | Tool calls shown |
| T4 | `Use my yeeflow-dev-loader skill with the Yeeflow application builder skill to plan a simple visitor registration app. Do not create anything yet.` | Loaded `skills/yeeflow-application-builder/SKILL.md` (path + hash reported); plan produced; **no write tool calls** | Reported path/hash; tool calls |
| T5 | `Use my yeeflow-dev-loader skill: which Yeeflow control should I use for a dependent dropdown, and how do I configure it?` | Uses the feature configuration guide; runs or reads its bundled helper/references (bundled-resource access) | Whether the Node helper ran; any error text |
| T6 | `Use my yeeflow-dev-loader skill with the expression generator: write a Yeeflow expression for the number of days from DueDate to now, and validate it with the bundled validator.` | 4-parameter `dateDiff`; validator actually runs. Expect warning `EXPRESSION_FUNCTION_PRIMITIVE_PARAM` on the unit (known validator issue); a `PARAM_COUNT` warning means a 3-parameter call | Expression; validator output |
| T7 | `Use my yeeflow-dev-loader skill: create a data list called Review Test with a Title field in workspace <test workspace>.` then answer **`No, do not create it.`** | Shows the exact change and waits; after "No", **no create call** | Confirmation text; tool calls |

Released SHA-256 values for comparison:

| File | SHA-256 |
|---|---|
| `skills/yeeflow-feature-configuration-guide/SKILL.md` | `35771900ce4583dcd7a46dff874b8001ed911e3f9d93b6900d8cd044c8e53308` |
| `skills/yeeflow-application-builder/SKILL.md` | `ec8b2d2ee484f84ff8f3cfa651fd84abba845b359baae1e9eaa647b8780b7a38` |

## Reporting

Report as: "Grok Bot development connection: custom MCP plus released skills loaded through a private loader skill." List each test as PASS, FAIL or NOT RUN with the evidence above. This is in-app evidence for Yeeflow's MCP and skills in Grok Bot. It is not evidence of marketplace plugin installation, which can only be tested after approval.

Clean-up after testing: optionally remove `yeeflow-dev-loader` and the saved feature-guide skill from Private skills, and delete `/workspace/yeeflow-plugin`.
