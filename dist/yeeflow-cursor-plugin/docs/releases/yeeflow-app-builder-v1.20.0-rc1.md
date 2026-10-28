# Yeeflow App Builder 1.20.0-rc1

Previous stable payload: 1.19.0. This prerelease prepares independent host-managed OAuth sign-in and multiple connected accounts without private App IDs in the distributable package. No changes to the production MCP service or the OpenAI version under review are included.

## Changes

- Add a `directory` archive profile declaring the unified HTTPS MCP integration with OAuth/DCR using the supported Codex compatibility layout. Keep the existing default Codex and private registered-App profiles.
- Apply account/organization selection, connection-scoped state, same-identity confirmation/readback and no alternate-identity retry rules to all 31 skills.
- Remove conflicting local environment-profile and API-key fallback instructions from the affected skills.
- Regenerate the Claude mirror as required by repository CI without a separate Claude store release or runtime acceptance claim. OpenAI account-management instructions are explicitly scoped to OpenAI hosts.
- Add archive-only version overrides, profile regression coverage and a hosted runtime acceptance matrix. Preserve all existing skills and shared runtime resources.

## Validation

The local candidate passed all three archive-profile tests, archived entrypoint guardrails, unified-MCP checks, source/distribution integration, document-workflow distribution and repository hygiene. Repeat release checks on this exact prerelease before publishing.

Installation smoke, host ingestion of the OAuth extension, production profile identity behavior and two-account isolation are separate checks. No runtime multi-account acceptance or public marketplace approval is claimed by this release. The generic portable MCP schema does not yet model the documented OpenAI auth extension; the candidate retains the supported Codex compatibility format.

## Distribution

Publish only to GitHub/private marketplace for testing. Keep `stable` on the last accepted release until installation acceptance. Do not upload to the OpenAI portal, reconnect/rescan its MCP binding, cancel review, replace the version under review or change its identity.

See [multi-account behavior and acceptance](../standards/multi-account-oauth.md). Installation results will be recorded separately after testing.
