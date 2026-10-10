# Organization repository copy — 2026-10-10

Destination: [Yeeflow/app-builder-plugin](https://github.com/Yeeflow/app-builder-plugin), private, default branch `main`.

The user authorized retaining the locked original repository and creating a complete development copy under the Yeeflow organization. Source: the intact, non-shallow local clone, including the unpublished Claude acceptance and troubleshooting updates. The locked source could not be refreshed; this record proves parity with the local snapshot, not a new inventory of the disabled source service.

## Copy verification

- Git connectivity check passed before publication.
- An atomic push copied 431 branches and 220 existing tags, without force or deletion.
- Remote readback compared every published branch/tag object ID with the local copy manifest: zero missing refs, extra refs or mismatches.
- `main` and `stable` remained at `7f4c6f23eb450619aeb0da55c3cc23288baf421d` (1.17.0 baseline).
- `codex/claude-plugin-adaptation` initially pointed to `32e3d3ea2023d0107abaa02cdc923a3ac5617ff9`, including all four previously unpublished follow-up commits. This branch subsequently adds the present copy/development documentation.
- The new repository is private and its default branch is `main`. No GitHub Releases or workflow runs were created by the initial copy.

The existing Codex marketplace ID `yeeflow`, plugin ID `yeeflow-app-builder`, `stable` branch and distribution paths are preserved. The shared source and OpenAI package were not rewritten as part of the copy. At the time of the initial copy, the Claude adaptation remained a separate branch and PR. The subsequent merge is recorded below.

## Development workflow

Use the organization repository for the next development changes. In the current checkout, the `organization` remote points to the new repository; the original remote remains available as a historical source when GitHub unlocks it. Keep releases explicit and keep the two hosts' package validation in place.

Existing installed-user configurations still point to their original source. Copying the repository does not automatically migrate installations or restore access to the locked original. The new private source also does not establish public marketplace availability or verified private-repository installation in Claude. Use the validated ZIP/local marketplace until the target host's repository access is separately verified.

Issues, pull requests, GitHub Release records/assets, secrets, branch protections and repository settings are not copied by Git. Original PR #518 remains in the original repository; the Claude changes are submitted through a new PR in the organization repository. This copy creates no new release tag or store submission.

## Subsequent merge and README update

[PR #1](https://github.com/Yeeflow/app-builder-plugin/pull/1) was merged into `stable` on 2026-10-10 at `68974a1c25fa777848b37f447a4f252b8a0f5835`. The merged tree matched the tested PR head exactly, and the OpenAI distribution was unchanged. At that stage `stable` included the Claude marketplace and package, while the default `main` branch retained the original package baseline. PRs #2 and #3 then updated the documentation and root README respectively; the later reconciliation below supersedes that temporary branch split.

Current installation instructions use the new organization URL. Historical release documents and already released package contents keep their original source information. This documentation update does not change plugin identities, migrate installed users, or establish installation acceptance from the new private repository.

## Restore the standard main-to-stable release order

The owner authorized reconciling the complete Claude support into `main` through a PR and then fast-forwarding `stable` to the accepted `main` commit. The integration preserves the histories of both branches. The default branch stays `main`, so repository consumers that read the default branch can find `.claude-plugin/marketplace.json` and the complete directory it references.

This is a branch reconciliation of existing validated 1.17.0 payloads. Neither host distribution is rebuilt or changed, and existing release tags remain at their original commits. No new final tag, GitHub Release, OpenAI store update or installed-source migration is part of this operation. After promotion, future changes follow development branch → PR into `main` → required validation/acceptance → fast-forward `stable` to the accepted `main` commit.
