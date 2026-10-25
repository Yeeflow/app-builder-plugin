# Independent OAuth sign-in and multiple connected accounts

GitHub/private-marketplace release candidate: `1.20.0-rc1`, based on stable `1.19.0`. Publishing this candidate and updating the local plugin are authorized. OpenAI store submission, review changes and production-server modifications remain outside this release.

## User behavior and implementation

Every user installs the same Yeeflow plugin in their own ChatGPT account and authorizes their own Yeeflow account. A user may connect additional accounts from plugin settings. The host stores OAuth grants and selects the relevant connection for each tool call. No user creates their own MCP server or provides an App ID. A shared integration is not a shared credential.

The new `directory` build profile in `scripts/plugin-host-profile.mjs` produces the supported `.codex-plugin/plugin.json` and `.mcp.json` compatibility layout. It declares exactly one unified HTTPS MCP server, the compatibility `http` transport, and `extensions.com.openai.auth` with `type: oauth` and `client.mode: dcr`. OAuth endpoints are discovered; there are no guessed endpoint overrides, hardcoded accounts, bearer headers, client secrets or registered private App references. DCR is a client-registration choice, not a multi-account feature switch. Existing `codex` and private `chatgpt-web` profiles remain available.

Conflicting legacy skill instructions for local environment profile selection and API-key fallbacks were removed. The shared `plugin-resource-access.md` footer is distributed to all 31 skills. It requires selection before ambiguous account-dependent operations, fresh workspace/resource discovery on identity changes, connection-scoped reuse of IDs and RowVersion, confirmation/readback under the same identity, and no fallback to another identity after a permission failure. These are assistant instructions; server-side authorization and host routing must independently enforce isolation.

## Build and local checks

Run from a complete Git checkout:

```sh
node scripts/test-repo-root-hygiene.mjs
npm run test:plugin-host-profiles
npm run test:unified-mcp
node scripts/test-document-workflow-distribution.mjs
node scripts/build-plugin-archive.mjs --tracked-only --profile directory \
  --version 1.20.0-local.1 --output /absolute/path/to/yeeflow-directory-local.zip
```

`--version` changes only the staged archive manifest. The source distribution version, marketplace identity and currently installed plugin are not changed. This is a local prerelease identifier, not a release tag or review submission. `--tracked-only` still packages working-copy contents of tracked files; new curated distribution files must be present in the Git index before they are included.

The host-profile regression builds and extracts all three layouts, checks 31 skills, exact shared-footer parity, the documented OAuth/DCR contract, no personal App references or credential fields, existing entrypoint regressions and byte parity of all shared files. It also checks that the source manifest is unchanged by version overrides and rejects private-App arguments for the directory profile. These checks do not contact the hosted service or prove live sign-in.

## Server profile contract to verify with the hosted service

The profile implementation is owned by the hosted MCP server, outside this repository. Do not add a local profile store, simulated production profile handler, raw REST login or token management to the plugin.

OpenAI supports connecting multiple accounts without a profile tool. A declared profile tool improves recognition and display, but an invalid profile response can block connection. Discover the actual tool name rather than assuming it is `get_profile`.

The designated profile tool must:

- Declare `_meta["openai/profile"]: true`, an empty-object input schema, a profile `outputSchema`, OAuth protection and read-only annotations.
- Resolve the profile exclusively from validated request credentials; return exactly one authenticated profile. Never accept a model-supplied account/user selector.
- Return top-level `{id, name?, email?, nickname?}` in `structuredContent` and the same serialized JSON in text content. `id` must be a nonempty opaque string; optional fields are strings and unavailable values are omitted. No extra response-envelope fields belong inside the profile object.
- Keep the same ID across refresh, reconnect, scope changes and display metadata changes. Independently connectable profiles need different IDs, never reassigned after deletion. Do not use email or an ID generated anew per session.
- Reflect Yeeflow's actual organization/authorization model. If organization-specific profiles can be connected independently, assign persistent opaque IDs for those profiles without encoding names or organizational relationships in the ID.
- Return normal auth failures for invalid credentials; never return a placeholder identity or another user's profile. All business tools and any sessions/caches must enforce the same credential and organization boundary.

## Runtime acceptance matrix

All rows below require hosted sign-in and are **pending** until executed with appropriately authorized test accounts. The local candidate does not create those accounts, store their credentials or change production permissions.

| Scenario | Expected observation |
| --- | --- |
| Two ChatGPT users install independently | Each authorizes their own Yeeflow identity; one user's session never changes the other's results |
| One user connects accounts A and B | Two independently usable OAuth connections with distinguishable profile labels |
| Select B after authorizing A | Login/authorization UI permits selecting B rather than silently binding A again |
| Read each account's workspace/app data | Correct identity and permissions per call; resources rediscovered after switching |
| Ambiguous account/organization request | Clarify before accessing identity-dependent business data |
| Refresh/reconnect/change display metadata | Same profile ID; labels may change |
| Separate organizations for one user, if supported | Correct profile identity under the actual server authorization model |
| A denied while B has access | Denied request stays denied; no silent retry using B |
| Disconnect/revoke A | A fails or requests reauthorization while B remains independent |
| Concurrent users and alternating account calls | No identity, tenant, session or cache crossover |
| Explicit cross-account comparison | Read only selected authorized connections and label each result's source |
| Confirmed test write and readback | Same account, organization and resource for confirmation, execution and verification |

For a captured tool declaration/response, structural conformance alone cannot prove stable IDs or isolation. Reconnect, permission-denial and concurrent identity scenarios must exercise the service.

## Scope of future public submission

The generic Agent Plugins 1.0.0 MCP schema currently rejects a per-server `extensions` field, while OpenAI documents that field for authentication. This candidate retains the supported Codex compatibility format instead of claiming portable schema conformance. Platform ingestion of the OpenAI auth extension remains a separate pending host check.

Current OpenAI guidance excludes ZIPs containing `apps` / `.app.json` or lifecycle hooks from public submission. The new profile produces the direct MCP compatibility format and leaves setup and OAuth grants to the platform. Before any later submission, verify current listing, reviewer account, test case, demo, domain verification and existing-review requirements. A local successful build is not portal ingestion, scan approval, publication or runtime acceptance. Do not alter the version currently under review to test this candidate.

## Primary sources

- [OpenAI multi-account behavior and profile identity contract](https://developers.openai.com/plugins/build/auth#support-multiple-accounts)
- [Portable plugin packaging and MCP OAuth/DCR configuration](https://developers.openai.com/plugins/build/plugins)
- [Submission formats, authentication setup and review lifecycle](https://developers.openai.com/plugins/deploy/submission)
- [Yeeflow Help Center](https://support.yeeflow.com/)
