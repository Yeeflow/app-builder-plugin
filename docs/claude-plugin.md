# Yeeflow for Claude

Claude 1.17.0 has passed the recorded package, repository installation and web upload checks. On 2026-10-10, the user confirmed that the MCP issue was resolved and separately confirmed application creation and verification through the Yeeflow plugin in Codex. Those results are recorded with their host and evidence source in [the latest verification status](claude-plugin-verification-2026-10-10.md). Its package and repository marketplace are separate from the existing OpenAI submission and publication lifecycle.

## Current web installation guide

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

## Build

Use Node and zip/unzip from the repository root:

```sh
npm run build:claude-plugin -- --output artifacts/claude/yeeflow-1.17.2.zip
npm run test:claude-plugin
npm run test:plugin-host-profiles
```

The builder reuses the existing tracked-file archive selector and dependency repairs, then converts only a temporary payload into `dist/yeeflow-claude-plugin`. It does not change the OpenAI payload or its transport settings. The ZIP has `.claude-plugin/plugin.json`, `.mcp.json`, 27 Skills and their shared dependencies at its root. Generated Claude files must be rebuilt rather than edited manually. The regression test compares the checked-in Claude directory against a fresh build, so a stale repository payload cannot pass merely because a new ZIP builds correctly.

Skills receive Claude-specific resource reading, hosted MCP discovery, OAuth and local-execution guidance after the frontmatter. Host-specific cache-update instructions are removed. Historical developer paths in Skills become historical artifact labels. References describing OpenAI release operations remain historical/maintainer documentation, not Claude publishing instructions. Never claim filesystem or Node execution in a host that does not expose those tools.

## Test installation

In Claude Desktop: Customize > Plugins > Add > Upload plugin. Select the ZIP and check the plugin name/version and Skill inventory. Complete Yeeflow login through Claude's MCP/connector OAuth flow. Never copy OpenAI credentials or tokens.

The [2026-10-08](claude-plugin-verification-2026-10-08.md) and [2026-10-09](claude-plugin-verification-2026-10-09.md) reports preserve historical OAuth failures. The user confirmed resolution on 2026-10-10; those historical errors are not the current reported blocker. [Claude's auth requirements](https://claude.com/docs/connectors/building/authentication#dcr-and-cimd-details) explain that CIMD selection requires both CIMD support and public-client token authentication in issuer metadata. The final registration mechanism and server-side fix were not independently captured in this checkout. Application creation verified in Codex is recorded as Codex evidence, not as a Claude-specific application test.

If Claude Code is available:

```sh
claude plugin validate ./dist/yeeflow-claude-plugin
claude plugin validate .
claude plugin marketplace add "$(pwd)"
claude plugin install yeeflow@yeeflow-claude
claude plugin list
```

Record host/version, installation source/result, loaded Skill count, OAuth result and discovered tools. Read a bundled reference and run a bundled validator with host file tools. Then list authorized workspaces and inspect a selected application read-only. Installation and local validation do not prove OAuth or Yeeflow runtime behavior.

A write/runtime test requires an explicitly selected disposable workspace and authorized creation scope. Read saved resources back and inspect the actual rendered page before claiming runtime acceptance. Do not create or change existing tenant applications solely to test installation.

## Marketplace and independent release

`.claude-plugin/marketplace.json` points only to `dist/yeeflow-claude-plugin`. Existing Codex marketplace and OpenAI build profiles retain their own paths. Commit the generated Claude directory with the source changes; ZIP artifacts remain ignored.

The organization development repository is now `Yeeflow/app-builder-plugin`; it is private. Access to this source requires the appropriate repository authorization. The earlier remote install smoke test used the original repository before it was locked; web marketplace installation from the new private repository was verified on 2026-10-10 for Yeeflow 1.17.2. Claude Code installation requires separate verification. The adaptation was merged into `stable` through [PR #1](https://github.com/Yeeflow/app-builder-plugin/pull/1) on 2026-10-10 (merge commit `68974a1c25fa777848b37f447a4f252b8a0f5835`). The complete support is now reconciled into the default `main` branch, and `stable` is promoted by fast-forward to the same validated commit. Both branches contain the marketplace and its referenced plugin directory.

For Claude Code clients that support authenticated private GitHub marketplaces, the branch-pinned source is:

```sh
claude plugin marketplace add Yeeflow/app-builder-plugin#stable
claude plugin install yeeflow@yeeflow-claude
```

The add/install sequence and `#stable` branch pinning follow the [official Claude Code hosting documentation](https://code.claude.com/docs/en/plugins/host-marketplace). For the Claude web/desktop Add marketplace repository flow, use `Yeeflow/app-builder-plugin` without `#stable`: the default `main` branch now contains the full marketplace and distribution. CLI branch suffix support is not evidence that the web form accepts that syntax. The 1.17.2 web sync and installation are recorded above; each other target account still needs verification; availability of the files in Git is not installation proof. A local manifest alone does not make repository installation available remotely. See [the organization copy record](repository-copy-2026-10-10.md) for the preserved release branches and compatibility boundary. Existing Codex user configurations are not migrated by this source copy.

Use Claude-specific tags such as `claude-v1.17.0-rc1`; final Claude tags require documented installation acceptance. Do not reuse OpenAI release tags or modify its submission packet for a Claude-only change. Shared Skill or MCP changes may affect both hosts and require both-host validation. The compatibility workflow tests packages on pull requests; it does not publish or release either host.

Official format reference: https://code.claude.com/docs/en/plugins-reference
Official marketplace reference: https://code.claude.com/docs/en/plugin-marketplaces

## Source integration and promotion

Use development branches and PRs into `main` for future changes. After the affected host checks and required installation acceptance pass, fast-forward `stable` to the accepted `main` commit. The 2026-10-10 reconciliation restores this branch order without rebuilding either package, changing version 1.17.0, moving existing release tags, or publishing to a store. Independent host packaging and tag namespaces remain unchanged.

## Public-directory candidate (2026-10-10)

The Claude-only candidate is **Yeeflow**, identifier `yeeflow`, version `1.17.2`; Codex remains `yeeflow-app-builder` 1.17.0. Existing verification records apply to the older Claude identity, not this candidate. MIT licensing was approved by the user for the Claude bundle. Company support: support@yeeflow.com; privacy policy: https://www.yeeflow.com/privacy.

Build and validate:

```sh
node scripts/build-claude-plugin.mjs --output artifacts/claude/yeeflow-1.17.2.zip
node scripts/test-claude-plugin.mjs
node scripts/prepare-claude-public-repository.mjs --output artifacts/claude/public-repository-candidate
```

The exporter requires an empty destination and preserves existing files. It copies only the Claude payload to the new repository root and creates a root-source marketplace. Initialize and publish that directory as a dedicated distribution repository only after review. The portal plugin path is empty for this repository, unlike `dist/yeeflow-claude-plugin` in the development repository. Set the final repository URL in the builder and candidate documentation when the destination is created. The company development repository remains private.

Current generated distribution remains above the documented 512-file / 256-KiB reviewer-hold thresholds. This candidate preserves shared dependencies instead of deleting referenced files merely to avoid review. The web installation check above does not imply portal validation, security-scan approval, live MCP/runtime acceptance, or a final release tag. Service data retention and personal-data answers still require implementation-backed confirmation. See the publication readiness audit for baseline findings.

## Shared data projection

The Claude build consolidates reviewed identical normalized JSON mirrors into directly readable ordinary files. See [optimization evidence](claude-shared-resource-optimization-2026-10-10.md). The generated `claude-shared-resources.json` maps old paths to canonical paths with SHA-256; no extraction or resource download step is required. Scripts and documentation are projected during build, so do not edit generated distribution files directly. Historical RC staging directories remain local snapshots; regenerate staging from the current distribution before publishing.

Historical version decision (before the 1.17.2 update, 2026-10-10): at the user’s explicit request, use 1.17.1 directly without an RC. This version choice does not establish Claude installation or runtime acceptance, which were pending at that point. The current web installation status is recorded above; live runtime acceptance remains separate. No GitHub release tag was created by that change.

Icon update (2026-10-10): Claude 1.17.2 declares icon ./assets/yeeflow-logo-only-blue.png using the existing official square blue Yeeflow mark. The patch version distinguishes this metadata update from 1.17.1. Web installation and name/version display were verified as described above; the Git importer stripped the icon and privacyPolicyUrl fields, so the generic icon remains.
