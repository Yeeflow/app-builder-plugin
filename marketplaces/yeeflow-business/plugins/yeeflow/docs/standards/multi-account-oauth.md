# Independent OAuth sign-in and multiple connected accounts

GitHub/repository release: `1.20.0`, finalized from `1.20.0-rc2` after the owner authorized formal publication and stable promotion. The previous stable payload was `1.19.0`; its latest historical final Git tag was `1.17.0`. OpenAI store submission, review changes and production-server modifications remain outside this release. Updating stable distributes the common payload and account-routing rules; it does not register an App for each user or add a multi-account UI to the tested direct-MCP host.

## User behavior and implementation

Every user installs the same Yeeflow plugin in their own ChatGPT account and authorizes their own Yeeflow account. On a supported registered-App host, a user may connect additional accounts from plugin settings. The host stores OAuth grants and selects the relevant connection for each tool call. End-user distribution must not require users to create an MCP server or provide an App ID; private developer registration is a separate setup workflow. A shared integration is not a shared credential.

Host layout matters. The tested local direct-MCP plugin did not expose Connect another account. A separate private registered App in the same Personal workspace did expose that entry and successfully retained both authorized accounts. Use the existing `chatgpt-web` profile with an accessible registered App for local/private multi-account tests; keep that private mapping outside the shared repository and public ZIPs. Creating the private test App is a developer setup step, not a setup requirement for end users. A successful test of this registered App does not establish that the default direct-MCP package offers the same account-management UI.

For a registered App, OpenAI can inject a required `link_id` into each exposed tool schema and list the available connections alongside it. Pass exactly the listed link for the requested account; the host selects that OAuth grant before calling Yeeflow. Do not invent a selector, forward `link_id` to upstream Yeeflow arguments, or use a profile ID/email in place of a link. The upstream profile input remains an empty object even when the host wrapper requires `link_id`.

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
- Resolve the profile exclusively from validated request credentials; return exactly one authenticated profile. Never accept a model-supplied account/user selector in the upstream schema. Host-injected connection routing happens before the upstream request and is not such a selector.
- Return top-level `{id, name?, email?, nickname?}` in `structuredContent` and the same serialized JSON in text content. `id` must be a nonempty opaque string; optional fields are strings and unavailable values are omitted. No extra response-envelope fields belong inside the profile object.
- Keep the same ID across refresh, reconnect, scope changes and display metadata changes. Independently connectable profiles need different IDs, never reassigned after deletion. Do not use email or an ID generated anew per session.
- Reflect Yeeflow's actual organization/authorization model. If organization-specific profiles can be connected independently, assign persistent opaque IDs for those profiles without encoding names or organizational relationships in the ID.
- Return normal auth failures for invalid credentials; never return a placeholder identity or another user's profile. All business tools and any sessions/caches must enforce the same credential and organization boundary.

## Runtime acceptance matrix

The following observations were made on 2026-10-25 using two authorized accounts in one ChatGPT Personal workspace, a separately registered private App, and its local private plugin projection. No credentials or private identity/connection IDs are included in this record.

- Both accounts remain visible in Connected accounts with different labels.
- Twelve registered-App profile calls passed: initial calls for both accounts, four alternating calls, and six concurrent calls. Each returned the intended account's stable identity; the two identities differ.
- Fresh `workspace_list` reads using each host-provided link succeeded and returned 20 and 11 rows respectively. Both responses reported TotalCount=0, so these counts do not establish complete pagination.
- The local registered-App test projection installed with 31 skills and 1,898 byte-matching files. This establishes installation and available registered-App tools; it does not prove an independent model conversation or every business workflow.
- Browser sign-in initially reused the first SSO identity. Explicit logout and second-account enterprise login were required before authorizing the second grant; the first connected grant remained available.

Remaining acceptance cases are separate from those observations. The plugin does not create test accounts, store credentials or change production permissions.

| Scenario | Observed status |
| --- | --- |
| Two ChatGPT users install independently | Pending; current run used one ChatGPT Personal workspace |
| One user connects accounts A and B | Passed for the private registered App; both grants retained |
| Select B after authorizing A | Passed after explicit browser identity selection; automatic SSO alone reused A |
| Read each account's workspace/app data | Workspace discovery passed; application/resource workflows pending |
| Ambiguous account/organization request | Rules distributed; independent conversation acceptance pending |
| Refresh/reconnect/change display metadata | Pending lifecycle stability checks |
| Separate organizations for one user, if supported | Two different profiles observed; broader organization switching pending |
| A denied while B has access | Pending negative permission test; no silent fallback is permitted |
| Disconnect/revoke A | Pending; neither test grant was revoked |
| Concurrent users and alternating account calls | Concurrent and alternating calls for two links passed; separate-user isolation pending |
| Explicit cross-account comparison | Authorized profile/workspace reads labelled by connection; broader comparison pending |
| Confirmed test write and readback | Pending; no business data was written |

For a captured tool declaration/response, structural conformance alone cannot prove stable IDs or isolation. Reconnect, permission-denial and concurrent identity scenarios must exercise the service.

## Scope of future public submission

The generic Agent Plugins 1.0.0 MCP schema currently rejects a per-server `extensions` field, while OpenAI documents that field for authentication. This release retains the supported Codex compatibility format instead of claiming portable schema conformance. Platform ingestion of the OpenAI auth extension remains a separate pending host check.

Current OpenAI guidance excludes ZIPs containing `apps` / `.app.json` or lifecycle hooks from public submission. The new profile produces the direct MCP compatibility format and leaves setup and OAuth grants to the platform. Before any later submission, verify current listing, reviewer account, test case, demo, domain verification and existing-review requirements. A local successful build is not portal ingestion, scan approval, publication or runtime acceptance. Do not alter the version currently under review to test this candidate.

## Primary sources

- [OpenAI multi-account behavior and profile identity contract](https://developers.openai.com/plugins/build/auth#support-multiple-accounts)
- [Portable plugin packaging and MCP OAuth/DCR configuration](https://developers.openai.com/plugins/build/plugins)
- [Submission formats, authentication setup and review lifecycle](https://developers.openai.com/plugins/deploy/submission)
- [Yeeflow Help Center](https://support.yeeflow.com/)
