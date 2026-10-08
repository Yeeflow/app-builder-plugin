# Claude plugin verification — 2026-10-08

Source baseline: origin/stable 7f4c6f23, Yeeflow 1.17.0. Claude adaptation remains a testing candidate.

## Verified locally

- Claude Code 2.1.293 (official @anthropic-ai/claude-code package) accepted the plugin manifest and repository marketplace with no warnings.
- Installed `yeeflow-app-builder@yeeflow-claude` from the local repository into a separate CLAUDE_CONFIG_DIR used only for this smoke test. `plugin list` reports enabled, version 1.17.0.
- `plugin details` inventories 27 Skills and one MCP server, `yeeflow_mcp`. Runtime tool schemas are not resolved by that inventory command.
- Claude Code installed the package from the remote GitHub branch `codex/claude-plugin-adaptation` using its repository marketplace.
- Claude web accepted the 6.8 MB ZIP upload, enabled the plugin, and displayed version 1.17.0, 27 Skills and one connector. This verifies web installation, not Desktop installation or authenticated tool calls.
- After the user approved adding the connector and read-only OAuth verification, Claude web added the connector using the default published client identity (CIMD). Starting OAuth returned HTTP 400 `invalid_request_error` in the browser log and left the connector Not connected. No authorization/login popup opened. This is an observed auth-start failure, not proof of its server-side cause.
- A later authorized Reconnect attempt left the connector in Connection issue and displayed: "Couldn't register with yeeflow_mcp's sign-in service." Claude suggested adding an OAuth Client ID in connector settings and provided support reference `ofid_b4bcd51e2959359a`. No login popup opened. This narrows the observed failure to the client's sign-in registration step; the underlying Yeeflow/Claude OAuth configuration cause is still unverified.
- After the user switched Claude accounts, the browser displayed a Pro account with no installed plugins. The same 1.17.0 ZIP installed successfully, remained enabled, and displayed 27 Skills and one connector. After account-specific user confirmation, the connector was added with automatic registration (DCR) and Sign in now. Connect displayed "Couldn't register with yeeflow_mcp's sign-in service" with support reference `ofid_a8babff3ec24b6b1`. No login popup opened, and the connector remained Not connected. Switching accounts and registration modes did not resolve the observed failure; its underlying cause remains unverified.
- Both inspected connector detail menus expose Remove, with no edit option observed. The original Free account's general Add custom connector menu was disabled. The DCR attempt used a new configuration in the Pro account; no old connector was deleted.
- Claude CLI MCP health check resolves the plugin server and reports `Needs authentication`; authenticated tool discovery has not been tested.
- The generated-payload freshness guard passes for the current repository directory and rejects an injected stale manifest version. Local screenshots and install artifacts are excluded from Git.
- Current GitHub workflows perform validation only; neither a push nor a Claude tag invokes a store-publication job.
- GitHub Actions run 37722682131 passed the host compatibility job for commit 75e66ac5, including the Claude payload freshness guard.
- Claude archive regression verifies root ZIP layout, complete Skill inventory, shared resource parity, executable validator entrypoints and unchanged OpenAI source files.
- Existing Codex/ChatGPT Web archive-profile regressions pass for both packages, including shared payload parity and validator entrypoints.

## Not yet verified

Claude Desktop upload, Claude-account synchronization, Yeeflow OAuth completion, runtime MCP tool discovery/invocation and business application rendering remain unverified. No Yeeflow tenant records were modified. The checked browser is signed in and the uploaded plugin is enabled. The connector is added but fails sign-in registration. Further work needs a verified registration fix or a Claude-compatible OAuth Client ID; no credential was invented or copied from another host. No Claude Desktop application was present in the checked application inventory.

## Workspace interruption

During preparation, the Documents checkout lost Git metadata and newly written documentation. The preserved builder/test edits were moved into an isolated clone of the same GitHub repository outside the interrupted Documents directory. The interrupted Documents checkout was not overwritten. Its restoration depends on clarification of the concurrent change/synchronization source.
