# Yeeflow Claude public-directory readiness audit

Date: 2026-10-10. Scope: local static audit and existing package regression, not an Anthropic portal validation or security review.
Source: stable, bdfe7d5c5be5148a63c597ece7568ef643a9b618; version 1.17.0. GitHub repository is PRIVATE, default branch main.

## Result

Not ready to submit this repository directly. Keep the development repository private and prepare a dedicated distribution repository containing only the Claude plugin at its root. Do not delete development assets to satisfy publication size limits.

Official criteria: https://claude.com/docs/plugins/pre-submission-checklist and https://claude.com/docs/plugins/submit (checked 2026-10-10).

## Blocking findings

1. Repository size: 639,313,323 bytes of tracked regular files (609.7 MiB); local git archive gzip estimate 509,731,760 bytes (486.1 MiB). Official maximum is under 256 MiB unpacked and 50 MiB archived. GitHub's exact archive size was not downloaded; both local measurements exceed limits substantially. Most tracked bytes are in dist (594,046,882), including historical release ZIPs. Selecting a plugin subfolder does not waive repository-wide limits.
2. License missing: no tracked LICENSE/COPYING file found; Claude manifest has no license field. Yeeflow must choose and approve its distribution license. Public source availability does not itself grant a license. Do not invent MIT/Apache terms.
3. Before publication, source repository must become public. Current repository may remain private during validation, but a separate reviewed public distribution repository is recommended.

## Review holds predicted by documented thresholds

Claude package: 1,869 regular files, 34,390,150 bytes (32.8 MiB), 27 skills. File count exceeds 512. Eighteen files exceed 256 KiB; none reaches 5 MiB. Largest: docs/reference/dashboard-page-layout-templates.json, 4,037,427 bytes. Other large files include product contracts, layout templates, full-app materializer, normalized controls and validators. Full size inventory is in artifacts/claude/publication-audit.json (local artifact).
These are reviewer holds, not automatic rejection. Reduce duplicated and maintainer-only content only after dependency analysis; preserve referenced resources and validators. A lean hosted-MCP edition is an option only with clearly declared capability changes.

## Naming and packaging adaptation

Requested public display name: Yeeflow. Recommended technical identifier: yeeflow (lowercase), displayName: Yeeflow, publisher: Yeeflow. Name availability is unknown until portal validation. Current Claude identifier is yeeflow-app-builder and has no displayName. The builder inherits the OpenAI identifier; the Claude test hardcodes it. Implement the change in the Claude builder and its marketplace/test/docs together, then regenerate. Do not rename Codex identity. Existing Claude installs may see the new identifier as a separate plugin, so document migration.

Manifest repository currently points to retired Yeeflow/app-builder-codex-plugin; change it to the eventual authoritative distribution repository. Bundled README is Codex-oriented (including old repository links and Codex installation instructions); replace through the builder with a Claude-facing README explaining Yeeflow, requirements, OAuth, examples, scripts, data destinations, authorization and proof limits. CLAUDE-README.md is a short testing-candidate note and is not adequate public onboarding.

Version remains 1.17.0 during audit; select a new release version when implementation is ready rather than republishing different content under the same version.

## Passed / observed

- Existing scripts/test-claude-plugin.mjs passed: committed payload freshness, root ZIP layout, 27 skills, shared resource parity, validator entrypoints, protected OpenAI payload unchanged.
- .claude-plugin/plugin.json exists; skill and MCP paths resolve inside package.
- .mcp.json declares one HTTP HTTPS endpoint: https://api.yeeflow.com/v1/mcp. No local server command, credential headers or embedded auth in that configuration.
- No package symlinks, OS junk files or tracked .gitattributes found.
- Repository has 6,810 files and approximately 7,381 files plus directories, below 10,000. Other portable-filename and complete text/binary/security checks have not been certified.
- Claude CLI is unavailable, so claude plugin validate was not run. Portal Validate and security scan have not been run. No claim of a full secret scan or license review.

## Behavior and submission evidence still needed

Recent Claude records show skill/reference loading and marketplace installation success. workspace_list returned records in one fresh conversation but failed date-time output validation in another; this is a session/path-dependent discrepancy, not established global outage. Raw schema and execution-path diagnostics are still needed. Skill tool base paths also differed from actual synced filesystem root; strengthen supported root discovery and regression coverage.

Application generation has saved resources but lacks complete report/theme/menu/runtime acceptance evidence. Public descriptions should not promise a fully validated one-shot app build.

Under the Yeeflow Team organization, submit the owned remote MCP connector separately and pair it with the bundle. Prepare accurate authentication, privacy, storage/retention, third-party destination and support-contact answers from the actual service implementation. No legal/privacy facts are inferred here. Confirm Team ownership in the portal before any submission. No portal draft, submission, repo visibility change, license grant, commit, push or release was performed by this audit.

## Recommended sequence

1. Choose license and company support/privacy information.
2. Prepare a minimal dedicated distribution repository, with the Claude plugin at root and no historical archives.
3. Apply Yeeflow naming, repository metadata, Claude README and resource-root guidance in the source builder; regenerate and run regression/dependency checks.
4. Resolve or precisely document the MCP response-validation discrepancy and run fresh-session read-only and scoped runtime acceptance tests.
5. In Yeeflow Team, validate a draft from the final repository; fix Blocks and review Holds, then complete connector and bundle submissions.
