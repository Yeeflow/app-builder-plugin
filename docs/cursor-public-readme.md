# Yeeflow

Yeeflow helps Grok Bot and Cursor agents work with business applications, records, tasks and workflows through guided skills and Yeeflow's hosted MCP connection. This package bundles 31 skills, shared templates and local validation tools. It supports application planning, incremental application building, package inspection and component generation.

## Requirements and connection

Use a Yeeflow account with permission for the selected workspace and operation. The plugin declares one remote MCP server, `yeeflow_mcp`, at https://api.yeeflow.com/v1/mcp. It authenticates with OAuth; no API key is needed. Do not paste passwords, tokens, cookies or API keys into chat. Authentication does not expand your Yeeflow permissions.

### Grok Bot

1. Open **Connect apps** in the sidebar and search for **Yeeflow**. Choose **Add**.
2. Open the installed plugin and confirm it shows **31 skills** and **1 connector** (`yeeflow_mcp`).
3. Choose **Authenticate** and sign in to Yeeflow in the browser.
4. Start a new conversation. Type `@` to attach Yeeflow, or `/` to use a Yeeflow skill.

If a team admin has restricted plugins, Yeeflow shows **Disabled by team admin**. The admin enables it from the team's Plugins & MCPs page in the Cursor dashboard.

### Cursor

Install **Yeeflow** from the Cursor Marketplace, or add `https://github.com/Yeeflow/app-builder-plugin` as a team marketplace. Then authenticate the `yeeflow_mcp` connection when prompted.

## Try it

- "Use Yeeflow to list my workspaces."
- "Use the Yeeflow application builder skill to plan an asset management application. Do not create anything yet."
- "Inspect the selected application read-only and identify missing configuration."

Choose the target workspace and application before writes. Review proposed changes and approve the intended scope before creation, updates, imports or deletion. Existing applications should be inspected before modification.

## Execution and data handling

Skills direct the agent to use the declared Yeeflow connection. Tool arguments may contain the business data, application configuration or identifiers needed for the requested operation, and tool results are returned to the conversation. Access is governed by the connected account and the Yeeflow service. This plugin does not bundle credentials, hooks or a local MCP server.

The bundle includes readable JavaScript/Node and Python helpers, schemas and templates. Where the host provides a terminal with Node, the agent may run local generators and validators. If Node is not available, the skill reports that validation did not run; that is not a passed validation. Only the declared hosted MCP connection is supported for live Yeeflow operations; do not use direct REST or API-key fallbacks.

## Verification limits

Local validation, MCP acceptance, configuration readback, Designer rendering and browser runtime tests are separate proof layers. Complete application runtime acceptance, including approvals, reports and dashboards, requires explicit testing of the generated app.

## License and support

This plugin bundle is distributed under the MIT License; see [LICENSE](LICENSE). The license covers the plugin software and does not grant access to the hosted Yeeflow service.

Support: support@yeeflow.com. Privacy policy: https://www.yeeflow.com/privacy. Source: https://github.com/Yeeflow/app-builder-plugin.
