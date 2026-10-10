# Yeeflow Claude adaptation — verification status, 2026-10-10

Package version: 1.17.0. Source baseline: stable/main `7f4c6f23eb450619aeb0da55c3cc23288baf421d`. Development branch: `codex/claude-plugin-adaptation`. Pull request: [#518](https://github.com/yeeflowsupport/app-builder-codex-plugin/pull/518).

## User acceptance and evidence source

On 2026-10-10 the user confirmed that the MCP problem had been resolved and personally verified. The user also confirmed that the Yeeflow App Builder plugin in Codex had created an application and completed its verification. The user considers the technical verification phase complete and authorized publishing the corresponding work to GitHub.

These are user-confirmed results. The exact server-side remediation, successful OAuth trace, registration mechanism and application test output were not supplied in this chat. No new business application was created by this publication task. Codex application creation/verification must not be relabeled as a Claude-hosted application test.

## Package evidence

The earlier recorded checks accepted Claude Code manifests and local/remote marketplace installation, plus Claude web ZIP upload at version 1.17.0 with 27 skills and one unified MCP connector. These package/install checks remain distinct from user-confirmed MCP resolution and Codex application verification. The dated OAuth failure reports remain historical troubleshooting evidence, not the current reported blocker.

## GitHub publication scope

Publish the independent Claude marketplace, generated distribution, builder, compatibility tests and updated verification documents on the existing PR branch. Keep version 1.17.0: this publication records the existing adapter and acceptance update; it does not change bundled shared skills or rebuild the existing OpenAI release as a new version.

The Claude compatibility test checks committed payload freshness, ZIP root layout, all 27 skills, shared-resource parity, validator entrypoints and preservation of the OpenAI package. The host-profile checks cover the existing Codex and ChatGPT Web archives as well. Validation results for this publication are recorded below after execution.

Source/PR publication, merging into the default branch, a versioned GitHub Release and store publication are separate actions. No Claude final release tag or store submission is part of this update. The previously tested branch-pinned installation route remains documented until the PR is merged.

## Publication validation

- Unified MCP integration passed: one HTTP connection, server-negotiated OAuth and no embedded credentials.
- Unified MCP migration checks passed for all 27 skills.
- Codex and ChatGPT Web archive regressions passed, including shared-payload parity and validator entrypoints.
- Claude package regression passed: fresh tracked-file build equals the checked-in distribution, ZIP root layout is correct, all 27 skills are present, and protected OpenAI files remain unchanged.
- `git diff --check` passed. Screenshots and local test artifacts remain ignored and are not publication inputs.

## Organization repository publication

After the original repository rejected publication, the user authorized copying the complete local source to the newly created private organization repository, [Yeeflow/app-builder-plugin](https://github.com/Yeeflow/app-builder-plugin). On 2026-10-10, the atomic push and remote readback succeeded for all 431 locally retained source branches and 220 tags. The Claude branch included all four previously unpublished commits through `32e3d3ea2023d0107abaa02cdc923a3ac5617ff9`; main and stable retained the 1.17.0 baseline exactly. The source repository could not be refreshed while locked, so completeness is relative to the verified local snapshot. See [the copy record](repository-copy-2026-10-10.md).
