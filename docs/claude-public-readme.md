# Yeeflow

Yeeflow helps Claude work with business applications, records, tasks and workflows through guided skills and Yeeflow's hosted MCP connection. This package bundles 27 skills, shared templates and local validation tools. It supports application planning, incremental application building, package inspection and component generation.

## Requirements and connection

Use a Yeeflow account with permission for the selected workspace and operation. Connect Yeeflow through Claude's connector OAuth flow. The declared MCP endpoint is https://api.yeeflow.com/v1/mcp. Do not paste passwords, tokens, cookies or API keys into chat. Authentication does not expand your Yeeflow permissions.

After installing the plugin, enable it and connect its Yeeflow connector in Customize. Start a new conversation to test the installed version. For a private repository marketplace, your GitHub account also needs access to that repository.

### Claude web and desktop: add the marketplace

1. Sign in to Claude and select the intended account or organization (for example, your Yeeflow Team).
2. Open **Customize → Plugins → Add → Add marketplace**.
3. Select or paste `https://github.com/Yeeflow/app-builder-plugin` and click **Sync**. This repository is private, so the connected GitHub account must have repository access.
4. Use the repository URL without `#stable`. This web flow reads the default `main` branch; both `main` and `stable` contain the complete Claude package.
5. After synchronization completes, open **Discover**, find **Yeeflow** from `app-builder-plugin`, and click **Add**.
6. In **Yours**, open Yeeflow and confirm it is enabled and shows **1.17.2**, **27 skills**, and **1 connector** (`yeeflow_mcp`).
7. Open its connector and complete the Yeeflow OAuth connection if requested. Use the intended Yeeflow account; Claude and other hosts authenticate separately.

### Update an existing marketplace installation

Open **Customize → Plugins → Add → Manage marketplaces**. For `app-builder-plugin`, open the action menu and choose **Check for updates**. Wait for synchronization, inspect any sync warnings, then check the installed plugin's version. Updating GitHub alone does not prove the installed plugin has updated.

The Claude plugin identifier changed from `yeeflow-app-builder` to `yeeflow`. If the old name remains installed, locate **Yeeflow** in Discover and add it; check Yours for stale or duplicate installations before testing. Avoid enabling both identities in the same test. Start a new conversation after an update; an existing conversation is not reliable evidence of the newly installed package.

### Use Yeeflow

Start a new conversation with:

```text
use yeeflow plugin to list all the workspaces
```

For application planning, try:

```text
Use the Yeeflow application builder skill to plan an asset management application. Do not create anything yet.
```

Select the workspace/application and approve the proposed scope before any write. A workspace-list result proves that read operation only, not application creation or full runtime acceptance. If a conversation rejects timestamp formatting, preserve the error and compare a fresh conversation; a fresh-session success does not establish that the original issue is resolved.

### Verified installation and icon limitation

On 2026-10-10, Chrome in the Renger / Yeeflow organization synchronized marketplace commit `b1bce89` and installed/enabled **Yeeflow 1.17.2**, with 27 skills and one connector. Yours showed one marketplace plugin named Yeeflow. This verifies installation and displayed metadata; no new live MCP or application runtime test was performed in that verification.

The package contains the official blue Yeeflow mark and declares `icon`. However, this Git marketplace importer reported that `icon` and `privacyPolicyUrl` were unrecognized and stripped them. The installed plugin therefore still displayed the default code glyph. These are [directory listing fields](https://code.claude.com/docs/en/plugins-reference#directory-listing-fields); their declaration does not prove support in every importer. Logo display in the public directory requires separate verification. The service privacy policy remains available at https://www.yeeflow.com/privacy.

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

Local validation, MCP acceptance, configuration readback, Designer rendering and browser runtime tests are separate proof layers. This package has not completed Claude public-directory review. Some sessions have rejected workspace timestamps during output-schema validation while fresh conversations accepted the response; the discrepancy remains under investigation. Complete application runtime acceptance, including approvals, reports and dashboards, requires explicit testing of the generated app.

## Version

Claude plugin identifier: `yeeflow`. Display name: **Yeeflow**. Version: `1.17.2`.

This replaces the earlier Claude identifier `yeeflow-app-builder`; existing installations may need an explicit migration. Codex retains its existing identity and version. Maintained source: https://github.com/Yeeflow/app-builder-plugin.

## License and support

This plugin bundle is distributed under the MIT License; see [LICENSE](LICENSE). The license covers the plugin software and does not grant access to the hosted Yeeflow service.

Support: support@yeeflow.com. Privacy policy: https://www.yeeflow.com/privacy. Refer to that policy for service data handling; this README makes no separate retention commitment.
