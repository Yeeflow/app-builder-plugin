# Grok Bot / Cursor validation — 2026-10-28

Package: Yeeflow for Grok Bot and Cursor **1.20.1**
Release: [`yeeflow-cursor-plugin-v1.20.1`](https://github.com/Yeeflow/app-builder-plugin/releases/tag/yeeflow-cursor-plugin-v1.20.1), target `7421465ab07dec519a3ace9305fd75992bd794b2`
ZIP SHA-256: `42200a36dc89d6f8aafa6df955650d4bcc5e50c1c2f69752356524d32420be10`
Status: **Cursor local plugin load and plugin OAuth verified. Grok Bot plugin install not achieved. No full workflow validation. Not submitted.**

## Evidence boundary

- "Observed" results were seen by Yeeflow in the host application UI or reported by the host's agent from actual tool calls. Raw transport traces were not exported.
- Repository and release checks were run independently from the published assets.
- No live Yeeflow writes were performed in any test below.

## Package and release (independent checks)

| Check | Result |
|---|---|
| Release targets merge commit `7421465`; not draft or prerelease | PASS |
| ZIP SHA-256 matches the `.sha256` asset | PASS |
| ZIP contents identical to committed `dist/yeeflow-cursor-plugin` (1,894 files) | PASS |
| `npm run test:cursor-plugin` on `main` | PASS |
| Public logo, `marketplace.json`, `plugin.json` URLs | HTTP 200 |
| GPL/AGPL/LGPL code in package | None found; MIT; no `node_modules` |
| Yeeflow OAuth metadata (`login.yeeflow.com`) | Dynamic client registration, client ID metadata documents, PKCE S256 and public clients advertised |

## Cursor desktop app: local plugin (observed)

| Check | Result |
|---|---|
| Released package copied to `~/.cursor/plugins/local` | Cursor lists **Yeeflow**, **31 skills**, and its own MCP with **105 enabled tools** |
| Plugin OAuth | Completed in the plugin's own authorization flow (user approved) |
| Plugin MCP calls (connection `plugin-yeeflow-yeeflow_mcp`, not a manually configured server) | `current_user_get`, `get_profile`, `workspace_list` succeeded; returned the signed-in user and 8 workspaces |
| Skill invocation | Cursor activity showed actual "Used" skill calls; a 31-row skill-by-skill report was produced |
| Safe dry-runs | Reading bundled references, synthetic examples, a Lookup knowledge search, local validation |
| Document workflow tests | 32/32 passed |

Limits:

- These are invocation and local checks, not proof that the 31 live business workflows work. Many skills stopped at missing plans, target applications, real packages or write authorization.
- One synthetic `dateDiff` expression example returned parameter-count and parameter-type warnings. It is **not** a clean pass and needs follow-up.

## Grok Bot (observed)

| Check | Result |
|---|---|
| Catalog search for Yeeflow | Not found (not listed) |
| Custom GitHub marketplace import in the individual account | None visible |
| Custom MCP server `https://api.yeeflow.com/v1/mcp` (added manually, not via plugin) | Connected; OAuth approved; `current_user_get`, `get_profile`, `workspace_list` succeeded; 105 tools |
| **Your plugins** after the Cursor local install | Shows only the manually configured `yeeflow_mcp` connector; **no Yeeflow plugin, no skills** |
| Skill invocation (`yeeflow-application-builder`) | "No such skill"; no skill host-loaded |
| Offline checks the Bot ran on its cloud computer | Not plugin or skill invocation evidence |

At the time of the check, the local `~/.grokbot` directory held only `computer-use`, and Grok Bot's installed-plugin UI did not show the Cursor local plugin. `~/.cursor/plugins` held `cache` and `local` and no imported marketplace. These observations do not establish a general synchronization rule.

## Not yet tested

- Grok Bot development connection with skills saved as private skills (procedure in [cursor-plugin.md](cursor-plugin.md#grok-bot-development-connection-pre-listing-in-app-test)).
- Cursor personal marketplace import with GitHub linked (known Cursor bug [cursor/plugins#452](https://github.com/cursor/plugins/issues/452)).
- Cursor team marketplace (requires Teams/Enterprise).
- Any live write, including the confirmation gate on a sandbox write.
- A dedicated reviewer account.
