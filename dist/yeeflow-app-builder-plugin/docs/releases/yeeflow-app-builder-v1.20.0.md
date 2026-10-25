# Yeeflow App Builder 1.20.0

Formal GitHub/repository release finalized from 1.20.0-rc2 with the owner's authorization to publish and update stable. The previous stable payload was 1.19.0; the latest historical final Git tag was 1.17.0. All 31 skills, plugin identity and the unified hosted MCP endpoint are retained.

## Behavior

Each user authenticates through the host with their own Yeeflow OAuth grant. Skills select the requested account/organization, scope cached resources and confirmations to that identity, and prohibit credential fallbacks or switching identities after permission denial. When a registered-App host supplies a connection list and link_id parameter, use only its exact listed values. The upstream profile input remains selector-free.

The codex package preserves the existing native direct-MCP transport. It supports each user's own sign-in, but the tested host did not expose Connect another account in that layout. A Git update does not add that UI or install a private registered App. The separately built chatgpt-web profile uses an accessible registered App, and two-account routing was verified through that path. Personal App IDs, grants and connection values are not distributed to other users.

The directory archive declares OAuth/DCR for later platform ingestion; ingestion and public-store multi-account availability remain unverified. This release does not submit to a store or modify the version already under review. Claude output synchronizes generated resources; its multi-account host behavior needs separate verification.

## Update an existing repository installation

Users with access to Yeeflow/app-builder-plugin and a marketplace ref of stable can refresh and reinstall the same plugin identity:

```sh
codex plugin marketplace upgrade yeeflow --json
codex plugin add yeeflow-app-builder@yeeflow --json
codex plugin list --marketplace yeeflow --json
```

Confirm installed version 1.20.0, then reload the host or start a new conversation to load the current skills. Complete personal Yeeflow OAuth if prompted. Refreshing the marketplace snapshot and updating the installed plugin are separate operations; a Git push alone does not prove an installed client has updated.

If pinned to an RC/old tag, change the marketplace Git ref to stable first. If using another repository, migrate to this repository through the supported marketplace settings. GitHub and workspace access are required. Store installations follow the store's publication/update process and are not updated by moving this branch.

## Verification and limits

RC2 passed both repository CI suites and local install readback. Its registered-App projection had 31 skills and 1,899 matching files. Two independently authorized accounts remained connected; sixteen profile reads across initial, alternating, concurrent and post-install checks returned stable distinct identities. Per-account workspace reads succeeded with 20 and 11 returned rows; TotalCount=0 prevents a complete-pagination claim. No business data was written.

Formal archives retain the tested runtime and account-routing rules. Release validation covers host profiles and archived entrypoints, workflow patterns/distribution, MCP integration/unified connection, Claude mirror consistency, feature guidance, repository hygiene, Collection regressions and package metadata. Post-publication install/source/hash readback is recorded separately.

Different ChatGPT users, grant refresh/reconnect/revocation, negative permissions, independent model conversations and business writes remain unverified. These limits are not removed by changing an RC version to a final version. See the [runtime matrix](../standards/multi-account-oauth.md).
