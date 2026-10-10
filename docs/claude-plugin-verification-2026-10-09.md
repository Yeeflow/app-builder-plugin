# Claude CIMD verification — 2026-10-09

Historical report: on 2026-10-10, the user confirmed MCP resolution and separate application creation/verification in Codex. See [the current status](claude-plugin-verification-2026-10-10.md); failures below describe the checks on this report's date.

The user reported that the technical team had implemented CIMD support and requested a new live verification. Existing authorization covers rebuilding the disposable unauthenticated connector and OAuth, followed only by workspace/application reads.

## Observed result

- Claude web was signed in to the Pro account. The uploaded Yeeflow plugin remained enabled at 1.17.0 with 27 skills and one connector.
- The previous unauthenticated DCR test connector was removed, and removal was verified in the connector list. The plugin connector was recreated with **Sign in now** and **Use Claude's published identity (CIMD)** selected. Automatic registration was not selected; no custom credentials or request headers were supplied.
- After Add and Connect, Claude displayed a sign-in registration failure with support reference `ofid_e073ca199c7e5be9`. It suggested retrying or adding an OAuth Client ID in connector settings.
- No login popup opened. The connector remained **Not connected · Custom**, with Connect available. OAuth completion and authenticated MCP tool calls could not be verified. No Yeeflow business data was read or modified.
- Settings and final-status screenshots are retained locally under ignored `artifacts/claude/claude-cimd-20261009-settings.jpg` and `artifacts/claude/claude-cimd-20261009-result.jpg`. The final-status screenshot records Not connected; the transient error notification was recorded separately from its visible text.

## Discovery check and interpretation

A focused browser navigation to `https://api.yeeflow.com/.well-known/oauth-protected-resource/v1/mcp` returned an IIS-style **404 - File or directory not found** page. This proves only that this specific standard discovery path returned 404 from the checked browser. It does not establish which metadata URL Claude actually used: a server-provided `WWW-Authenticate` resource_metadata URL or another discovery path may differ. No issuer metadata or backend request logs were obtained.

[Claude's current authentication documentation](https://claude.com/docs/connectors/building/authentication#dcr-and-cimd-details), checked on 2026-10-09, requires the issuer discovery metadata to advertise both `client_id_metadata_document_supported: true` and `none` in `token_endpoint_auth_methods_supported`. If either is missing, Claude falls back to DCR. Therefore the selected UI option alone does not prove this request actually used CIMD, and the generic registration error does not independently prove a DCR call occurred.

The technical team should inspect the deployed discovery document served to Claude and correlate authorization/discovery logs with the above attempt/reference. Check the resource metadata location, the first authorization_servers issuer, both CIMD flags, and whether a DCR registration request occurred. If CIMD was selected, inspect acceptance/fetching of Claude's actual client metadata URL and the reason for rejection. Do not include tokens, authorization codes, client secrets, or full OAuth query strings in shared evidence.

## User-requested repeated authorization attempts

The user explicitly requested multiple authorization attempts for the technical team to correlate logs. Three attempts used the existing CIMD-configured connector, without changing its configuration. Times below were captured immediately before clicking Connect; Singapore time (UTC+08:00), 2026-10-09.

| Attempt | Approximate start | Claude support reference |
| --- | --- | --- |
| 1 | 16:42:50 | `ofid_17e75cfbada6fc3c` |
| 2 | 16:43:11 | `ofid_d580d01df1980069` |
| 3 | 16:43:35 | `ofid_352a4a7984c30435` |

Each attempt temporarily disabled Connect, then restored it and displayed the same sign-in registration failure with its own reference. No login popup opened; the connector remained Not connected. No authenticated business read or write occurred. Screenshots are retained locally as `artifacts/claude/claude-cimd-20261009-batch-1.jpg`, `-batch-2.jpg`, and `-batch-3.jpg`.

## Remaining gates

### Follow-up after issuer metadata was supplied

The user supplied the complete public JSON from `https://login.yeeflow.com/.well-known/openid-configuration`. It declares issuer `https://login.yeeflow.com`, `client_id_metadata_document_supported: true`, token endpoint authentication methods including `none`, and PKCE methods including `S256`. Authorization, token and DCR registration endpoints are `/connect/authorize`, `/connect/token`, and `/connect/register` on that issuer. These declared fields meet Claude's documented CIMD selection conditions; the presence of a DCR endpoint does not itself require DCR. This is inspection of user-supplied metadata, not independent live retrieval: the web reader could not access the URL and Chrome displayed ERR_BLOCKED_BY_CLIENT.

The existing CIMD-configured connector was retried after this inspection. It again failed before any login popup, with reference `ofid_a0776eab6977a45c`, and remained Not connected. Only the existing Claude tab was present among Claude pages. The screenshot is `artifacts/claude/claude-cimd-20261009-metadata-retry.jpg`.

Missing CIMD declarations in the supplied JSON should no longer be proposed as the cause. Remaining unknowns are which discovery document Claude actually consumed, whether it reached the supplied issuer, which identity mechanism it selected, and any rejection of Claude's client metadata identity. Correlating the attempt with discovery/authorization/registration logs is required to distinguish these. The generic registration error alone cannot identify the selected mechanism. No authenticated business reads or writes occurred.

OAuth login/consent, token exchange, MCP tool discovery, workspace read and application read remain pending. The result is a failed live connection attempt, not proof that all CIMD configurations are incompatible or that the team's implementation was not deployed.

This report is local. No remote publication or business-data change was performed.
