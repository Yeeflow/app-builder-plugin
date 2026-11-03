# Yeeflow App Builder 1.20.1

Publisher packaging preparation patch. Preserve the original plugin identity, all 31 skills, existing account-routing guidance and the native direct-MCP endpoint. No business service or OAuth grants are changed.

## Change

Add a managed-marketplace archive profile that retains yeeflow-app-builder / Yeeflow and all shared resources, declares exactly one required registered App, and removes direct MCP discovery files. Publisher inputs must include fresh app/read metadata. Reject absent App mappings, unknown/non-public channels and RC Test dependencies. Identity overrides are forbidden. Current package checks do not establish canonical plugin UI merging or cross-user availability.

## Distribution boundary

The stable repository payload still declares the direct unified MCP connection. Updating it installs this patch and its documentation; it does not add Connected accounts or distribute the private test App. Do not substitute a renamed private test App for a production integration.

On 2026-10-25, the official publishing portal still showed the existing Yeeflow 1.16.4 as In review / Not published. The formal App was absent from the current Personal user's app/read result. No upload-new-version or publish action was exposed on that plugin's detail page. The separate private RC Test remains INDIVIDUAL. The existing review, server definition, grants and private test connections were preserved.

OpenAI approval/publication and an accessible production App remain external prerequisites. After publication, build the original-identity managed candidate and verify with another Personal user that one installed Yeeflow entry includes the skills, Manage supports two retained accounts and profile/workspace reads use the chosen account. If a separate dependency entry is required, the one-entry acceptance has not passed. Only then replace the stable transport with the registered-App payload.

## Validation

Four host profiles preserve 31 skills and shared resources; required-App/original-identity checks, private-App rejection and archived validator regressions pass. Claude generated-resource parity passes. Repository installation, live read-only smoke and stable source readback are recorded separately during release. No new hosted multi-account acceptance is claimed.

Update the existing stable marketplace and reinstall yeeflow-app-builder@yeeflow, then confirm version 1.20.1. Restart the host or use a new conversation to load refreshed skills. Source refresh, local installation, App availability and store publication are separate states.
