# Yeeflow App Builder Plugin

Work with business data, manage tasks, and build applications in Yeeflow through guided skills and the unified hosted MCP connection. This repository maintains separate packages for Codex, ChatGPT Web and Claude.

Current repository: [Yeeflow/app-builder-plugin](https://github.com/Yeeflow/app-builder-plugin). It is private; repository-based installation requires access to this repository. The default **`main` branch** contains the complete Codex and Claude marketplace sources. **`stable`** follows the validated release commit for branch-pinned installations. Claude support first entered `stable` through [PR #1](https://github.com/Yeeflow/app-builder-plugin/pull/1) and has now been reconciled into `main`.

## Version and packages

The current package version is **1.17.0**, with 27 Skills and the unified OAuth MCP connection. The existing OpenAI package includes direct Form Action execution guidance and helpers for Custom Code; see the [1.17.0 release notes](docs/releases/yeeflow-app-builder-v1.17.0.md) for feature-specific validation boundaries.

| Host | Marketplace / plugin | Package on `main` and `stable` |
| --- | --- | --- |
| Codex App | `yeeflow` / `yeeflow-app-builder` | `dist/yeeflow-app-builder-plugin` |
| ChatGPT Web | Host-specific registered Apps profile | Built from the shared OpenAI payload; see [build profiles](docs/standards/plugin-host-build-profiles.md) |
| Claude candidate | `yeeflow-claude` / `yeeflow` (1.17.1) | `dist/yeeflow-claude-plugin` |

The repository name is independent of the plugin identity. Codex identities remain unchanged; the Claude public-directory candidate uses `yeeflow` with display name Yeeflow. Publishing source changes to GitHub does not submit or update an OpenAI store listing or migrate existing installations.

## Install in Codex App

For a new repository-based installation with access to the private repository:

```text
Source: https://github.com/Yeeflow/app-builder-plugin.git
Git ref: stable
Sparse paths:
  .agents/plugins/marketplace.json
  dist/yeeflow-app-builder-plugin
```

Expected installed identity:

```text
Marketplace: Yeeflow
Plugin: Yeeflow
Version: 1.17.0
```

The source above identifies the current repository; a Codex installation from this new private source has not yet been recorded. Existing installations keep their configured source until explicitly migrated. Do not remove a working installation solely because the repository URL changed.

Verify metadata from a checkout of `stable`:

```sh
node scripts/inspect-codex-plugin-cache-metadata.mjs --root . --expect-version 1.17.0
```

## ChatGPT Web package

ChatGPT Web uses a separate build profile with registered Apps. The Codex repository installation settings above are specific to Codex App. See [host build profiles and verification](docs/standards/plugin-host-build-profiles.md) for packaging; store submission and updates follow the OpenAI publication process separately.

## Install in Claude

Claude uses its own marketplace and package on `main` and `stable`. For Claude Code with authenticated access to this private GitHub repository:

```sh
claude plugin marketplace add Yeeflow/app-builder-plugin#stable
claude plugin install yeeflow@yeeflow-claude
```

The marketplace add/install sequence and branch pinning follow the [official Claude Code marketplace documentation](https://code.claude.com/docs/en/plugins/host-marketplace). Installation from this new private repository has not yet been verified. For the ZIP upload and local marketplace routes, build steps and recorded verification boundaries, see [Yeeflow for Claude](https://github.com/Yeeflow/app-builder-plugin/blob/stable/docs/claude-plugin.md).

For the Claude web/desktop **Add marketplace** repository flow, use `Yeeflow/app-builder-plugin` without a branch suffix. The default `main` branch includes both `.claude-plugin/marketplace.json` and the directory it references. The `#stable` command above is for Claude Code; do not assume the web form accepts CLI branch syntax. Repository access and successful marketplace synchronization still require verification in the target account.

Complete Yeeflow OAuth through the selected host's MCP connection. Each host authenticates separately; do not copy credentials or tokens between hosts.

## Collection generation rules

- Plan native Column width after binding actual fields and placing the Collection: give titles and narratives more space, keep choices and operations compact, and preserve readable widths in narrow cards.
- Use native Dynamic field Text length only for narrative content with an independent full-value route; keep titles and identifiers complete. Native tooltips do not guarantee full text.
- Prefer native properties over Custom CSS. Explicit column widths, text limits and full-value access can be provided in App Plan.

- Scope Button and Select CSS to the owning control; reuse CSS classes and keep CSS IDs unique.
- Enable row-menu auto positioning and apply readable foreground colors for known dark menus.
- Use actual single/multiple-choice values for Container/Text Dynamic styles, with independent border, background and text colors and a neutral fallback. Multi-choice requires verified storage and exact membership conditions.
- Default new ordinary Dashboard Collections to 10 records per page. Explicit page sizes win; existing configurations, selected-detail records, limited results and print layouts retain their semantics.

See the [native column width and density standard](docs/standards/native-collection-density-standard.md), [toolbar standard](docs/standards/collection-toolbar-style-standard.md) and [choice and pagination standard](docs/standards/dashboard-collection-choice-pagination-standard.md). Local generation checks do not establish runtime acceptance for every page or device.

## What Is Included

- `.agents/plugins/marketplace.json` for Codex marketplace installation.
- `.claude-plugin/marketplace.json` and `dist/yeeflow-claude-plugin` for Claude installation.
- `dist/yeeflow-app-builder-plugin` with bundled skills, plugin metadata, and `.mcp.json` hosted MCP configuration.
- `skills/` and `generated-skills/` source mirrors for ongoing development.
- `scripts/` and root development helpers for YAP/YAPK/YDL/YWF generation, inspection, validation, and package automation dry-runs.
- `schemas/yap-schema.json`, `schemas/yapk-schema.json`, and `schemas/yapk-schema-codex.json`.
- Sanitized docs, studies, standards, templates, examples, and historical notes.
- Hosted scoped MCP configuration; no standalone OAuth, REST/API, or credential-handling helpers.

## Key Workflows

Use the plugin to plan, incrementally build, generate, inspect, validate, and harden Yeeflow applications and packages. A normal requirement-to-live-application request defaults to the confirmation-gated MCP incremental path; package generation is an explicit delivery choice. The current package preserves support for:

- Hosted Yeeflow MCP tools for App Builder, Operations, Admin and Service Portal through the unified `https://api.yeeflow.com/v1/mcp` endpoint, with OAuth negotiated by Codex and no credentials embedded in the Plugin.
- YAP/YAPK/YDL/YWF validators and wrapper helpers.
- Application plan conformance, navigation checks, runtime-binding lessons, and release hygiene.
- Generated-final YAPK hard gates for API-issued ID provenance, complete navigation runtime metadata, and App Plan resource completeness.
- Dashboard grid-table Collection hard gate for dashboard record-list wrapper structure, detail links, title/header metadata, and runtime/designer proof boundaries.
- UI/Summary/KPI runtime hard gates for page-by-page UI contracts, export-proven style shapes, Summary metadata, visible KPI evidence or labeled fallback, grid-table quality, and upgrade ListSetID/app identity stability.
- Supplier runtime/design fidelity gates and validation-layer proof gates for installed `ListSetID` runtime URL proof, design section/KPI/page chrome mapping, real Data Filter and Collection bindings, analytics/progress/Summary/KPI fidelity, canonical one-PNG-per-page design artifacts, and separated proof layers from schema validation through runtime browser proof and pixel comparison.
- Managed app connector design notes and safe example metadata.

## Safety Boundaries

Never commit tenant credentials, OAuth tokens, API keys, private tenant URLs, raw Yeeflow exports, decoded package payloads, generated runtime packages, screenshots, cert/key files, or local cache folders.

API work must use documented Yeeflow endpoints only. Do not guess paths, do not make arbitrary raw API calls, and do not run mutating/package operations without explicit confirmation. Stronger confirmation is required for package upload, import, install, upgrade, create, update, and delete operations.

Proof boundaries remain separate:

- Local validation is not import proof.
- API acceptance is not runtime proof.
- Runtime proof applies only to the exact tested scope.

## Yeeflow Access

All live Yeeflow operations use the unified hosted MCP service declared in the plugin. Authentication is negotiated by the service; the plugin has no local OAuth flow, REST CLI, API-key configuration, or workspace environment variables. Use `workspace_list` to inspect workspaces and the matching capability tool on the unified connection for every read or confirmed write. Do not paste credentials, tokens, cookies, or passwords into chat.

## Development Assets

The new repo intentionally keeps more than the minimal plugin distribution:

- root-level generation and inspection scripts restored from the legacy repo
- sanitized runtime study docs and normalized references
- plugin release hygiene and legacy release notes under `docs/legacy/`
- managed app connector design and `.app.example.json`
- safe examples and generated-folder guidance

Generated runtime packages and raw proof payloads remain excluded.

Release packaging and cache smoke must use tracked files as the source of truth. Do not package the raw working tree with ad hoc `zip dist/...` commands; use `git ls-files`-based packaging or an equivalent tracked-file manifest so untracked local artifacts cannot enter a release. Run `node scripts/test-repo-root-hygiene.mjs` before release packaging; it fails on tracked or untracked Finder/copy-style duplicates such as `name 2.md`, `name 3.json`, `name 4.mjs`, or `SKILL 2.md`.

## Repository and installation history

The previous repository was renamed from `Yeeflow/app-builder-codex-plugin` to `yeeflowsupport/app-builder-codex-plugin` when the personal account was renamed. It is retained as a historical source and was locked at the time of the organization copy. Use `Yeeflow/app-builder-plugin` for current development and the `stable` installation source above. See the [organization copy and merge record](https://github.com/Yeeflow/app-builder-plugin/blob/stable/docs/repository-copy-2026-10-10.md).

The earlier `Yeeflow/yeeflow-codex-plugins` repository used marketplace `yeeflow-internal`, plugin `yeeflow-builder`, and `dist/yeeflow-builder-plugin`. Current Codex packages use `yeeflow` / `yeeflow-app-builder` and `dist/yeeflow-app-builder-plugin`. Use the current identity for new installations.

Changing an installation source, publishing a GitHub Release and updating a store listing are separate steps. Historical release documents and already released package contents describe their original release source; this README documents the current organization repository.

## Host-specific builds

The OpenAI archive builder supports Codex (direct MCP) and ChatGPT Web (registered Apps), retaining all 27 Skills and shared references. See [build profiles and verification](docs/standards/plugin-host-build-profiles.md). Run `npm run test:plugin-host-profiles` before releasing either package.

Claude uses a separate builder and distribution. See [Claude build and installation testing](https://github.com/Yeeflow/app-builder-plugin/blob/stable/docs/claude-plugin.md). Shared Skill or MCP changes require validation for the affected hosts. GitHub package checks do not publish either package to a store.

## Development and release branches

Keep `main` as the default integration branch and `stable` as the validated installation channel. Start development from the latest `main` in a dedicated branch, push the reviewed changes, and merge through a PR into `main` after the required checks and acceptance. Promote `stable` by fast-forwarding it to the accepted `main` commit; do not publish unrelated changes directly to `stable`.

For a new package version, rebuild and validate the affected host distributions, use RC tags when needed, and document installation acceptance before creating a final tag and GitHub Release. Preserve existing release tags. Store submissions, installed-source migration and live tenant runtime acceptance remain separate operations.
