# Yeeflow

Yeeflow helps Claude work with business applications, records, tasks and workflows through guided skills and Yeeflow's hosted MCP connection. This release candidate bundles 27 skills, shared templates and local validation tools. It supports application planning, incremental application building, package inspection and component generation.

## Requirements and connection

Use a Yeeflow account with permission for the selected workspace and operation. Connect Yeeflow through Claude's connector OAuth flow. The declared MCP endpoint is https://api.yeeflow.com/v1/mcp. Do not paste passwords, tokens, cookies or API keys into chat. Authentication does not expand your Yeeflow permissions.

After installing the plugin, enable it and connect its Yeeflow connector in Customize. Start a new conversation to test the installed version. For a private repository marketplace, your GitHub account also needs access to that repository.

## Try it

- “Use Yeeflow to list my workspaces.”
- “Read the Yeeflow application builder skill and help me plan an asset management application. Do not create anything yet.”
- “Inspect the selected application read-only and identify missing configuration.”

Choose the target workspace and application before writes. Review proposed changes and approve the intended scope before creation, updates, imports or deletion. Existing applications should be inspected before modification.

## Execution and data handling

Skills direct Claude to use the declared Yeeflow connector. Tool arguments may contain the business data, application configuration or identifiers needed for the requested operation, and tool results are returned to the Claude conversation. Access is governed by the connected account and the Yeeflow service. This plugin does not bundle credentials or a local MCP server.

The bundle includes readable JavaScript/Node and Python helpers, schemas and templates. Claude may read these files and, where its host provides execution tools, run local generators and validators. Generated artifacts belong in the user's working directory, not the installed plugin cache. Some maintenance references discuss other platforms; they are not instructions to publish or install on those platforms. Do not run maintenance/release workflows unless explicitly requested.

Filesystem and execution availability differs across Claude surfaces. Missing local execution must be reported; it is not a passed validation. Only the declared hosted MCP connection is supported for live Yeeflow operations; do not use direct REST or API-key fallbacks.

## Verification limits

Local validation, MCP acceptance, configuration readback, Designer rendering and browser runtime tests are separate proof layers. This candidate has not completed Claude public-directory review. Some sessions have rejected workspace timestamps during output-schema validation while fresh conversations accepted the response; the discrepancy remains under investigation. Complete application runtime acceptance, including approvals, reports and dashboards, requires explicit testing of the generated app.

## Release candidate

Claude plugin identifier: `yeeflow`. Display name: **Yeeflow**. Version: `1.17.1`.

This replaces the earlier Claude identifier `yeeflow-app-builder`; existing installations may need an explicit migration. Codex retains its existing identity and version. Maintained source: https://github.com/Yeeflow/app-builder-plugin.

## License and support

This plugin bundle is distributed under the MIT License; see [LICENSE](LICENSE). The license covers the plugin software and does not grant access to the hosted Yeeflow service.

Support: support@yeeflow.com. Privacy policy: https://www.yeeflow.com/privacy. Refer to that policy for service data handling; this README makes no separate retention commitment.
