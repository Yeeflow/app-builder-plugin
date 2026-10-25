# Yeeflow App Builder Plugin

Release **1.20.1** adds publisher-side packaging for a future single-entry registered-App distribution. It preserves all 31 skills and the existing direct-MCP transport on the repository stable channel. This is a packaging preparation patch: it does not enable Gmail-style Connected accounts in Git installations. A public registered Yeeflow App and separate-user hosted acceptance remain blocked by OpenAI publication. See [release notes](docs/releases/yeeflow-app-builder-v1.20.1.md) and [verification limits](docs/standards/multi-account-oauth.md). This GitHub release does not publish or update a ChatGPT store listing.

Work with business data, manage tasks, and build applications in Yeeflow through guided skills and the unified hosted MCP connection. This repository maintains separate packages for Codex, ChatGPT Web and Claude.

Current repository: [Yeeflow/app-builder-plugin](https://github.com/Yeeflow/app-builder-plugin). It is private; repository-based installation requires access to this repository. The default **`main` branch** contains the complete Codex and Claude marketplace sources. **`stable`** follows the validated release commit for branch-pinned installations. Claude support first entered `stable` through [PR #1](https://github.com/Yeeflow/app-builder-plugin/pull/1) and has now been reconciled into `main`.

## Version and packages

The Codex/OpenAI release version is **1.20.1**. The generated Claude mirror is synchronized at the same version to preserve shared-resource parity; Claude host installation and multi-account runtime require separate acceptance. Both retain 31 Skills and the unified OAuth MCP connection. 1.18.0 added the Yeeflow Feature Configuration Guide skill and 1.18.1 fixes its helper under symlinked plugin caches; see the [1.18.0](docs/releases/yeeflow-app-builder-v1.18.0.md) and [1.18.1](docs/releases/yeeflow-app-builder-v1.18.1.md) release notes and the [1.17.0 release notes](docs/releases/yeeflow-app-builder-v1.17.0.md) for direct Form Action execution.

| Host | Marketplace / plugin | Package on `main` and `stable` |
| --- | --- | --- |
| Codex App | `yeeflow` / `yeeflow-app-builder` | `dist/yeeflow-app-builder-plugin` |
| ChatGPT Web | Host-specific registered Apps profile | Built from the shared OpenAI payload; see [build profiles](docs/standards/plugin-host-build-profiles.md) |
| Claude | `yeeflow-claude` / `yeeflow` (1.20.1) | `dist/yeeflow-claude-plugin` |

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
Version: 1.20.1
```

RC installations from this repository and the registered-App private test projection were verified before finalization. Existing installations keep their configured source/ref until updated; moving `stable` does not update a plugin pinned to an old release tag or to another repository.

For an existing Codex installation using this repository's `stable` ref:

```sh
codex plugin marketplace upgrade yeeflow --json
codex plugin add yeeflow-app-builder@yeeflow --json
codex plugin list --marketplace yeeflow --json
```

Confirm the installed version is `1.20.1`, then start a new conversation or reload the host to use the updated skills. If the installation is pinned to an RC or old tag, change its marketplace Git ref to `stable` first. Users of a different repository or the ChatGPT store follow their own source's update process. Repository access and each user's own OAuth authorization are still required. See [upgrade details and host limits](docs/releases/yeeflow-app-builder-v1.20.1.md).

Verify metadata from a checkout of `stable`:

```sh
node scripts/inspect-codex-plugin-cache-metadata.mjs --root . --expect-version 1.20.1
```

## ChatGPT Web package

ChatGPT Web uses a separate build profile with registered Apps. The Codex repository installation settings above are specific to Codex App. See [host build profiles and verification](docs/standards/plugin-host-build-profiles.md) for packaging; store submission and updates follow the OpenAI publication process separately.

## Install in Claude

Claude uses its own marketplace and package on `main` and `stable`. For Claude Code with authenticated access to this private GitHub repository:

```sh
claude plugin marketplace add Yeeflow/app-builder-plugin#stable
claude plugin install yeeflow@yeeflow-claude
```

The marketplace add/install sequence and branch pinning follow the [official Claude Code marketplace documentation](https://code.claude.com/docs/en/plugins/host-marketplace). The Claude web marketplace installation was verified on 2026-10-10; Claude Code installation remains separately unverified. For the ZIP upload and local marketplace routes, build steps and recorded verification boundaries, see [Yeeflow for Claude](https://github.com/Yeeflow/app-builder-plugin/blob/stable/docs/claude-plugin.md).

For the Claude web/desktop **Add marketplace** repository flow, use `Yeeflow/app-builder-plugin` without a branch suffix. The default `main` branch includes both `.claude-plugin/marketplace.json` and the directory it references. The `#stable` command above is for Claude Code; do not assume the web form accepts CLI branch syntax. Repository access is required in each target account.

Complete Yeeflow OAuth through the selected host's MCP connection. Each host authenticates separately; do not copy credentials or tokens between hosts.

### Claude web and desktop: add the marketplace

1. Sign in to Claude and select the intended account or organization (for example, your Yeeflow Team).
2. Open **Customize → Plugins → Add → Add marketplace**.
3. Select or paste `https://github.com/Yeeflow/app-builder-plugin` and click **Sync**. This repository is private, so the connected GitHub account must have repository access.
4. Use the repository URL without `#stable`. This web flow reads the default `main` branch; both `main` and `stable` contain the complete Claude package.
5. After synchronization completes, open **Discover**, find **Yeeflow** from `app-builder-plugin`, and click **Add**.
6. In **Yours**, open Yeeflow and confirm it is enabled and shows **1.20.1**, **31 skills**, and **1 connector** (`yeeflow_mcp`). Confirm host installation separately; this release's live multi-account checks used ChatGPT Personal.
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

## Document workflow skills

Version 1.19.0 adds three document/workflow specialists and six existing skill enhancements (31 skills total). See the [release notes](docs/releases/yeeflow-app-builder-v1.19.0.md) for scope and verification boundaries. Installed Codex RC discovery and resource reads passed; final installation is rechecked before stable promotion.
