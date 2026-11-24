# Grok Bot development-connection results — 2026-11-03 (Yeeflow 1.20.2)

Package: Yeeflow for Grok Bot and Cursor **1.20.2** (release [`yeeflow-cursor-plugin-v1.20.2`](https://github.com/Yeeflow/app-builder-plugin/releases/tag/yeeflow-cursor-plugin-v1.20.2), ZIP SHA-256 `3818818501e7068c387450f50917512c19ebd1f61d708b6c0851d0dc142c3a93`)
Procedure: [Grok Bot development-connection test kit](grok-bot-dev-test-kit.md)
Earlier run on 1.20.1: [2026-10-28 results](grok-bot-dev-connection-validation-2026-10-28.md)
Status: **Released 1.20.2 skill files ran in Grok Bot through a private loader skill and a custom MCP connection. This is not a Grok Bot Marketplace plugin installation. All 31 skills, writes, full live workflows and Designer/runtime behaviour were not verified. Not submitted.**

## What this test is, and is not

| Mechanism | Result on 1.20.2 |
|---|---|
| **Marketplace plugin installation** (Yeeflow plugin in Grok Bot **Your plugins** with its own connector and 31 skills) | **Not achieved.** No verified way to install an unlisted plugin from an individual Grok Bot account. |
| **Direct private-skill registration** of a released `SKILL.md` | **Not run on 1.20.2.** On 1.20.1 it was host-recognized but not byte-identical and carried no bundled files. |
| **Loader** (new private skill `yeeflow-dev-loader-1202` reading the checksum-verified release at `/workspace/yeeflow-plugin-1.20.2`) | Worked for T1 and T3–T6 as recorded below. |
| **Custom MCP connection** (existing manually added `yeeflow_mcp`) | Read calls succeeded (T3). |

## Evidence boundary

- Results are the Grok Bot agent's reported file, tool and script evidence. Raw transport traces were not exported; the Bot reports it deleted temporary raw outputs that contained private IDs.
- No Yeeflow business data was created or changed.
- Independently checked by Yeeflow afterwards: the ZIP SHA-256 and the three reported `SKILL.md` hashes (application-builder, feature configuration guide, expression generator) match the published 1.20.2 release asset.
- Test files on the Bot's computer: `/workspace/yeeflow-plugin-1.20.2`, `/workspace/yf1202-tests/yf1202-test-log.md`, `/workspace/yf1202-tests/t4-visitor-registration-plan.md`. The new loader `yeeflow-dev-loader-1202`, the earlier loader and the earlier saved feature-guide skill remain in Private skills and are available to the user's Grok Bot assistants.

## Results

| # | Test | Result | Evidence and limits |
|---|---|---|---|
| Setup / T1 | Released files and version | **PASS** | ZIP checksum matched; extracted without overwriting to `/workspace/yeeflow-plugin-1.20.2`; manifest `yeeflow` `1.20.2`; 31 `SKILL.md` files. |
| T2 | Direct skill registration stays byte-identical | **NOT RUN** | The 1.20.1 observation (not byte-identical; no bundled files) stands separately. |
| T3 | Reads through `yeeflow_mcp` | **PASS** | `current_user_get`, `get_profile`, `workspace_list` through the existing custom connection; 11 workspaces returned. |
| T4 | Application builder, plan only | **PASS (plan only)** | Loaded `skills/yeeflow-application-builder/SKILL.md`, SHA-256 `c7c9ec1f…129dcf99` (matches release). Visitor-registration plan produced; no writes. Full standard specification templates and planning validators were not run. |
| T5 | Feature guide and bundled helper | **PARTIAL** | Loaded `skills/yeeflow-feature-configuration-guide/SKILL.md`, SHA-256 `b67fdbf5…1f00a5d8` (matches release). The bundled `knowledge.mjs` ran but found no direct dependent/cascading dropdown entry; it returned Lookup entries. Filtering a Lookup by the parent value was the Bot's inference and was not runtime-verified. |
| T6 | Expression validator | **PASS** | Expression-generator `SKILL.md` SHA-256 `4324ab67…1cc1210ebf` (matches release). `dateDiff(StartDate, EndDate, "day", false)`: `valid: true`, `issues: []`, inferred number. Negative control: a wrapped unit produced `EXPRESSION_DATEDIFF_UNIT_WRAPPED` as expected. The bundled expression smoke test passed. Designer and runtime behaviour not tested. |
| T7 | Write confirmation | **SIMULATION ONLY** | The Bot described the target selection and approval it would require, without a create request or create tools. This does not show that the connector or host enforces a write gate and is not a passed write-gate test. (On 1.20.1 a requested write paused and was declined; that was not repeated on 1.20.2.) |

## Not tested

- Grok Bot Marketplace plugin installation (possible only after listing, or through a private distribution path not yet verified).
- The other skills in Grok Bot; any approved or declined write on 1.20.2; full live business workflows; Designer and runtime behaviour.
- A dedicated reviewer account.
