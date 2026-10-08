# Claude plugin verification — 2026-10-08

Source baseline: origin/stable 7f4c6f23, Yeeflow 1.17.0. Claude adaptation remains a testing candidate.

## Verified locally

- Claude Code 2.1.293 (official @anthropic-ai/claude-code package) accepted the plugin manifest and repository marketplace with no warnings.
- Installed `yeeflow-app-builder@yeeflow-claude` from the local repository into a separate CLAUDE_CONFIG_DIR used only for this smoke test. `plugin list` reports enabled, version 1.17.0.
- `plugin details` inventories 27 Skills and one MCP server, `yeeflow_mcp`. Runtime tool schemas are not resolved by that inventory command.
- Claude CLI MCP health check resolves the plugin server and reports `Needs authentication`; authenticated tool discovery has not been tested.
- Claude archive regression verifies root ZIP layout, complete Skill inventory, shared resource parity, executable validator entrypoints and unchanged OpenAI source files.
- Existing Codex/ChatGPT Web archive-profile regressions pass for both packages, including shared payload parity and validator entrypoints.

## Not yet verified

Claude Desktop upload, Claude-account synchronization, Yeeflow OAuth login, runtime MCP tool discovery/invocation and business application rendering remain unverified. No Yeeflow tenant records were modified. The available browser opens the Claude login page; no Claude Desktop application was present in the checked application inventory.

## Workspace interruption

During preparation, the Documents checkout lost Git metadata and newly written documentation. The preserved builder/test edits were moved into an isolated clone of the same GitHub repository outside the interrupted Documents directory. The interrupted Documents checkout was not overwritten. Its restoration depends on clarification of the concurrent change/synchronization source.
